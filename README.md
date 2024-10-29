# PyLineSelect

PyLineSelect is a Visual Studio Code extension that helps Python developers quickly select entire code blocks (functions, classes, if-statements, loops, etc.) by simply placing the cursor at the start or within a block of code. This is especially useful when refactoring or analyzing code, as it eliminates the need for manually selecting a block line by line.

## Features

### Selection for Block-Starting Keywords
When the cursor is placed on a line that contains a block-starting Python keyword such as `def`, `class`, `if`, `for`, `while`, `try`, or `with`, Pyselect will automatically select all lines beneath it, continuing until the next line that starts a new block.

### Selection Based on Indentation

When the cursor is on a line without any specific Python keywords, Pyselect will select all lines above and below that share the same indentation level as the current line.

## How to Install

1. Download and install the extension via the Visual Studio Code marketplace or from source.
2. Once installed, activate the extension via the command palette.

## How to Use

1.	Open a Python file in Visual Studio Code.
2.	Place the cursor inside any function, class, or block (e.g., if, for, while, etc.).
3.	Use the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS) and type PySelect: Select Block or run the command directly via the shortcut:
- Command: PySelect: Select Block
4.	The entire block, including decorators (if present), will be selected.

## Extension Commands
Command	Description
`PyLineSelect: Select Block` selects the code block.