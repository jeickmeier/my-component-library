# Cell Renderers Module

A simplified system for rendering table cell content with different formats and styles using React Context and hooks.

## Features

- Modern React hooks-based API
- TypeScript support with comprehensive type definitions
- Built-in renderers for common data types
- Easy registration of custom renderers
- Context-based provider for application-wide renderer registration

## Usage

```tsx
// 1. Wrap your application with the provider
import { createDefaultCellRendererProvider } from '../components/data-table/cell-renderers';

function App() {
  return createDefaultCellRendererProvider(
    <YourApp />
  );
}

// 2. Use renderers in your components
import { useCellRenderer } from '../components/data-table/cell-renderers';

function MyTable() {
  // Get a renderer for a specific type
  const renderText = useCellRenderer('text');
  const renderDate = useCellRenderer('date');
  
  return (
    <table>
      <tr>
        <td>{renderText({ getValue: () => 'Hello world' }, { truncate: true, maxLength: 10 })}</td>
        <td>{renderDate({ getValue: () => new Date() }, { locale: 'en-US' })}</td>
      </tr>
    </table>
  );
}

// 3. Register custom renderers
import { useCellRenderers } from '../components/data-table/cell-renderers';

function MyCustomComponent() {
  const { registerRenderer } = useCellRenderers();
  
  useEffect(() => {
    registerRenderer('custom', (props, config) => {
      const value = props.getValue();
      return <div className={config?.className}>{String(value)}</div>;
    });
  }, []);
  
  // ...
}
```

## Available Renderers

- `text`: Plain text with optional truncation
- `status`: Status indicators with color coding
- `currency`: Formatted currency values
- `date`: Localized date formatting
- `boolean`: Yes/No or custom boolean representations
- `null`: Customizable null value display

## Directory Structure

```
cell-renderers/
├── index.tsx     - Main entry point with hooks and context
├── types.tsx     - Type definitions
├── renderers.tsx - All renderer implementations
└── README.md     - Documentation
```

This simplified structure replaces the previous more complex structure:

```
cell-renderers/
├── core/
│   ├── index.tsx
│   ├── registry.tsx
│   └── types.tsx
├── renderers/
│   ├── boolean-renderer.tsx
│   ├── currency-renderer.tsx
│   ├── date-renderer.tsx
│   ├── index.tsx
│   ├── null-renderer.tsx
│   ├── status-renderer.tsx
│   └── text-renderer.tsx
└── index.tsx
```

The new approach offers several advantages:
- Simplified code structure with fewer files
- Modern React patterns with hooks and context
- Improved developer experience
- Reduced boilerplate code
- Better maintainability 