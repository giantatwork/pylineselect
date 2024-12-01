import * as vscode from "vscode";

const keywordRegex =
  /^\s*(def|class|if|elif|else|for|while|try|except|finally|with|async|raise|return)(\s|:)(.*)$/;
const decoratorRegex = /^\s*@\w+.*/;

export function findSelectionRange(
  document: vscode.TextDocument,
  editor: vscode.TextEditor
) {
  let startLineNumber = 0;
  let firstLineNumber = 0;
  let skippedEmptyLines = 0;

  if (editor.selection.isEmpty) {
    startLineNumber = editor.selection.active.line;
    firstLineNumber = startLineNumber;
  } else {
    firstLineNumber = editor.selection.start.line;
    startLineNumber = editor.selection.end.line + 1;
    if (startLineNumber >= document.lineCount) {
      return null;
    }

    while (document.lineAt(startLineNumber).isEmptyOrWhitespace) {
      skippedEmptyLines += 1;
      startLineNumber += 1;
      if (startLineNumber >= document.lineCount) {
        return null;
      }
    }
  }

  let firstLine = document.lineAt(firstLineNumber);
  let startLine = document.lineAt(startLineNumber);

  let firstIndentation = firstLine.firstNonWhitespaceCharacterIndex;

  let startIndentation = 0;
  if (startLine.isEmptyOrWhitespace) {
    startIndentation = firstIndentation;
  } else {
    startIndentation = startLine.firstNonWhitespaceCharacterIndex;
  }

  let end = startLineNumber;

  if (startIndentation < firstIndentation) {
    return {
      startLineIndex: startLineNumber,
      endLineIndex: end - 1 - skippedEmptyLines,
    };
  }

  const lowestIndentation = Math.min(startIndentation, firstIndentation);
  const keywordFirst = keywordRegex.test(firstLine.text);

  for (let i = startLine.lineNumber + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      if (keywordFirst) {
        continue;
      } else {
        break;
      }
    }
    if (line.firstNonWhitespaceCharacterIndex < lowestIndentation) {
      break;
    }
    if (
      line.firstNonWhitespaceCharacterIndex === lowestIndentation &&
      (keywordRegex.test(line.text) || decoratorRegex.test(line.text))
    ) {
      break;
    }
    end = i;
  }

  return { startLineIndex: startLineNumber, endLineIndex: end };
}

export function selectBlock() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "python") {
    return;
  }

  const document = editor.document;
  const selectionRange = findSelectionRange(document, editor);
  if (selectionRange === null) {
    return;
  }

  let startLine = selectionRange.startLineIndex;
  const endLine = selectionRange.endLineIndex;

  if (!editor.selection.isEmpty) {
    if (editor.selection.start.line < startLine) {
      startLine = editor.selection.start.line;
    }
  }

  const endPosition = new vscode.Position(
    endLine,
    document.lineAt(endLine).text.length
  );

  const newSelection = new vscode.Selection(
    new vscode.Position(startLine, 0),
    endPosition
  );

  editor.selection = newSelection;
  editor.revealRange(
    new vscode.Range(endPosition, endPosition),
    vscode.TextEditorRevealType.Default
  );
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "pylineselect.select",
    () => {
      selectBlock();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
