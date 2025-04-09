# Code Concatenator

A simple utility to concatenate all code files in a directory (including nested subdirectories) into a single text file. This is particularly useful for preparing code to be input into Large Language Models (LLMs) for code analysis or question answering.

## Installation

```bash
# Clone or download this repository
git clone https://github.com/yourusername/code-concatenator.git
cd code-concatenator

# Make the script executable
chmod +x concat-codebase.js

# Optional: Install globally
npm install -g .
```

## Usage

```bash
# Basic usage
node concat-codebase.js ./path/to/your/codebase

# Or if installed globally
concat-codebase ./path/to/your/codebase

# With options
node concat-codebase.js ./path/to/your/codebase --output output.txt --max-size 2
```

## Options

- `--output, -o`: Specify output file path (default: code-concatenated.txt)
- `--ignore-dirs`: Comma-separated list of directories to ignore (default: .git,node_modules,dist,build,.next,.cache)
- `--ignore-exts`: Comma-separated list of file extensions to ignore (default: .lock,.log,.map,.md,.svg,.png,.jpg,.jpeg,.gif,.ico)
- `--max-size`: Maximum file size in MB to include (default: 1)
- `--with-line-numbers`: Include line numbers in the output
- `--help, -h`: Show help message

## Example

```bash
# Concatenate all files in a React project but exclude test files
node concat-codebase.js ./my-react-app --ignore-dirs "node_modules,.git,__tests__" --output react-code.txt

# Concatenate only TypeScript files in a project
node concat-codebase.js ./my-project --ignore-exts ".js,.jsx,.css,.html" --output typescript-only.txt
```

## Output Format

The output file contains:
- A header with generation timestamp
- Each file separated by dividers
- File paths clearly labeled
- Optional line numbers

## Why use this tool?

When working with LLMs for code analysis, providing the full context of a codebase can help the model understand the project structure and give more accurate answers. This utility makes it easy to prepare your code for such scenarios by:

1. Including all relevant files in a single document
2. Maintaining file structure information
3. Excluding binary files and other non-relevant content
4. Providing clear file boundaries for better context
