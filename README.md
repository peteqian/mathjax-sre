# Accessible TeX to SVG Converter

A TypeScript tool that converts TeX mathematical equations to accessible SVG with speech descriptions using MathJax and Speech Rule Engine. For exploration purposes only.

## Features

- Converts TeX equations to SVG
- Generates natural language descriptions for mathematical expressions
- Adds accessibility attributes (aria-label, role, title, desc)
- Supports complex mathematical notation
- Uses MathML for semantic representation

## Installation

```bash
git clone https://github.com/peteqian/mathjax-sre
cd mathjax-sre
npm install
```

## Usage

1. Build the project:

```bash
npm run build
```

2. Run the example:

```bash
npm start
```

3. Use in your code:

```typescript
import { convertTexToSvg } from './src';

async function example() {
  const { svg, speech } = await convertTexToSvg('x^2 + y^2 = z^2');
  console.log('Speech:', speech);
  console.log('SVG:', svg);
}
```

## Example Output

Input TeX:

```tex
E = mc^2
```

Generates an SVG with:

- Proper mathematical rendering
- ARIA attributes for accessibility
- Natural language description: "E equals m c squared"
- Title and description elements

## Development

```bash
# Watch mode for development
npm run build -- --watch

# Run tests
npm test
```

## Credits

- MathJax
- Speech Rule Engine
- Node.js
- TypeScript
