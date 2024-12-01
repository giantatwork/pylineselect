import * as assert from "assert";
import * as vscode from "vscode";
// import { findBlockStart } from "../extension";

suite("findBlockStart Tests", () => {
  let document: vscode.TextDocument;

  suiteSetup(async () => {
    document = await vscode.workspace.openTextDocument({
      language: "python",
      content: `
      def foo():
        x = 1
        if x > 0:
          print(x)
            x = 2
        return x

        y = foo()

      def bar(param1):
        y = 4
          x = 3
            z = 5`,
    });

    await vscode.window.showTextDocument(document);
  });

  test("should return the correct start line for a block with the same indentation", async () => {
    // Define the starting line (e.g., line 3, with indentation level of 8 for "print(x)")
    const startLine = 9;
    const currentIndentation = 4;

    console.log(document.getText());

    // Call the findBlockStart function
    // const result = findBlockStart(document, startLine, currentIndentation);

    // Assert that the result is the expected start line
    // assert.strictEqual(result, 11);
  });
});
