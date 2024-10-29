import * as vscode from "vscode";

const startBlockRegex =
  /^\s*(def|class|if|for|while|try|with|async)\s*(.*)\s*:\s*$/;
const classOrFunctionRegex = /^\s*(def|class)\s+\w+.*/;
const decoratorRegex = /^\s*@\w+.*/;

const findStartBlock = (line: vscode.TextLine) => {
  return startBlockRegex.test(line.text);
};
const findClassOrFunction = (line: vscode.TextLine) => {
  return classOrFunctionRegex.test(line.text);
};
const findDecorator = (line: vscode.TextLine) => {
  return decoratorRegex.test(line.text);
};

export function lineChecks(
  line: vscode.TextLine,
  currentIndentation: number
): boolean {
  if (line.firstNonWhitespaceCharacterIndex < currentIndentation) {
    return false;
  }
  if (
    line.firstNonWhitespaceCharacterIndex === currentIndentation &&
    (findClassOrFunction(line) || findStartBlock(line))
  ) {
    return false;
  }
  return true;
}

export function findRange(
  document: vscode.TextDocument,
  startLine: vscode.TextLine
): { startRange: number; endRange: number } {
  const isClassOrFunction = findClassOrFunction(startLine);
  const isStartBlock = findStartBlock(startLine);
  const currentIndentation = startLine.firstNonWhitespaceCharacterIndex;
  let end = startLine.lineNumber;
  let start = startLine.lineNumber;

  if (isClassOrFunction || isStartBlock) {
    for (let i = startLine.lineNumber + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      if (line.isEmptyOrWhitespace) {
        continue;
      }
      if (!lineChecks(line, currentIndentation)) {
        break;
      }
      if (findDecorator(line)) {
        break;
      }
      end = i;
    }
  } else {
    for (let i = startLine.lineNumber + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      if (!lineChecks(line, currentIndentation)) {
        break;
      }
      end = i;
    }
    for (let i = startLine.lineNumber - 1; i >= 0; i--) {
      const line = document.lineAt(i);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      if (!lineChecks(line, currentIndentation)) {
        break;
      }
      start = i;
    }
  }

  return { startRange: start, endRange: end };
}

export function selectBlock() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "python") {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;

  let startLineNumber = selection.isEmpty
    ? selection.active.line
    : selection.end.line + 1;

  let startLine = document.lineAt(startLineNumber);
  if (startLine.isEmptyOrWhitespace) {
    return;
  }

  const selectionRange = findRange(document, startLine);

  let rangeStart = selectionRange.startRange;
  const rangeEnd = selectionRange.endRange;

  if (!selection.isEmpty) {
    if (selection.start.line < rangeStart) {
      rangeStart = selection.start.line;
    }
  }

  const newSelection = new vscode.Selection(
    new vscode.Position(rangeStart, 0),
    new vscode.Position(rangeEnd, document.lineAt(rangeEnd).text.length)
  );

  editor.selection = newSelection;
  editor.revealRange(newSelection);
}

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage(
    'Extension "pylineselect" is now active!'
  );
  const disposable = vscode.commands.registerCommand(
    "pylineselect.select",
    () => {
      selectBlock();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
