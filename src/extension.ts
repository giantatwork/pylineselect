import * as vscode from "vscode";

const startBlockRegex =
  /^\s*(def|class|if|for|while|try|with|async)\s*(.*)\s*:\s*$/;
const branchBlockRegex = /^\s*(else|elif|except|finally)\s*(.*)\s*:\s*$/;
const decoratorRegex = /^\s*@\w+(\.\w+)*(\(.*\))?\s*$/;
const classOrFunctionRegex = /^\s*(def|class)\s+\w+\s*(\(.*\))?\s*:\s*$/;

const findStartBlock = (line: vscode.TextLine) => {
  return startBlockRegex.test(line.text);
};
const findBranchBlock = (line: vscode.TextLine) => {
  return branchBlockRegex.test(line.text);
};
const findDecorator = (line: vscode.TextLine) => {
  return decoratorRegex.test(line.text);
};
const findClassOrFunction = (line: vscode.TextLine) => {
  return classOrFunctionRegex.test(line.text);
};

export function findClassFunctionBlock(
  document: vscode.TextDocument,
  startLineNumber: number,
  currentIndentation: number,
  isClassOrFunction: boolean,
  isDecorator: boolean
): { start: number; end: number } {
  // check if current line is decorator
  // if yes, look up and down for more decorators
  // till class or function block
  // then stop at next startblock

  // if current line is function or class -> look above for decorator -> get new start line
  let startRange = startLineNumber;
  while (startRange > 0) {
    startRange--;
    const line = document.lineAt(startRange);
    if (!findDecorator(line)) {
      break;
    }
  }

  // if current lines is decorator -> look above and below for decorator -> get new start line

  // search up for one or more decorators

  let end = startLineNumber;
  let startBlockCount = 0;

  for (let i = startLineNumber + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    if (line.firstNonWhitespaceCharacterIndex < currentIndentation) {
      break;
    }
    let isStartBlock = findStartBlock(line);
    if (isStartBlock) {
      break;
    }
    end = i;
  }

  // search down
  // accept everything except new start block

  return { start: startRange + 1, end: end };
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

  const currentIndentation = startLine.firstNonWhitespaceCharacterIndex;

  let isClassOrFunction = findClassOrFunction(startLine);
  let isDecorator = findDecorator(startLine);

  let range = findClassFunctionBlock(
    document,
    startLineNumber,
    currentIndentation,
    isClassOrFunction,
    isDecorator
  );

  startLineNumber = range.start;
  let endLineNumber = range.end;

  // let startOffset = 0;
  // let decorator: boolean = false;

  // if (findClassOrFunction(startLine)) {
  //   const previousLineNumber = startLineNumber - 1;
  //   if (previousLineNumber > 0) {
  //     const previousLine = document.lineAt(previousLineNumber);
  //     if (findDecorator(previousLine)) {
  //       startOffset = 1;
  //     }
  //   }
  // } else if (findDecorator(startLine)) {
  //   startLineNumber += 1;
  //   startLine = document.lineAt(startLineNumber);
  //   startOffset = 1;
  //   decorator = true;
  // }

  // const startBlock = findStartBlock(startLine);
  // const branchBlock = findBranchBlock(startLine);
  // const currentIndentation = startLine.firstNonWhitespaceCharacterIndex;

  // if (!startBlock && !branchBlock) {
  //   startLineNumber = findBlockStart(
  //     document,
  //     startLineNumber,
  //     currentIndentation
  //   );
  // }

  // const endLineNumber = findBlockEnd(
  //   document,
  //   startLineNumber,
  //   currentIndentation,
  //   startBlock,
  //   branchBlock,
  //   decorator
  // );

  // startLineNumber -= startOffset;

  if (!selection.isEmpty) {
    if (selection.start.line < startLineNumber) {
      startLineNumber = selection.start.line;
    }
  }

  const newSelection = new vscode.Selection(
    new vscode.Position(startLineNumber, 0),
    new vscode.Position(
      endLineNumber,
      document.lineAt(endLineNumber).text.length
    )
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
