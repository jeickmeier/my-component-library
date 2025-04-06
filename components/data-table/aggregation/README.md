# Aggregation Module

This module provides a comprehensive system for aggregating data in tables. It's designed to work with TanStack Table but can be used independently for any data aggregation needs.

## Features

- Type-safe aggregation function definitions
- Registry system for managing aggregation functions
- Comprehensive set of built-in aggregation functions
- Extensible architecture for custom aggregations
- Utility functions for common aggregation operations

## Directory Structure

The module is organized by functionality:

```
aggregation/
├── index.ts                  # Main exports and public API
├── registry.ts               # Registry implementation
├── types.ts                  # Type definitions
├── utils.ts                  # Utility functions
├── functions/                # Aggregation function implementations
│   ├── index.ts              # Re-exports all functions
│   ├── basic.ts              # Basic aggregations (sum, avg, min, max, count)
│   ├── statistical.ts        # Statistical aggregations (median, stdDev, percentile)
│   ├── grouping.ts           # Grouping aggregations (unique, mode, range)
│   └── text.ts               # Text operations (first, last, join)
└── README.md                 # Documentation
```

## Usage

### Basic Usage

```typescript
import { defaultRegistry } from '../components/data-table/aggregation'

// Use a built-in aggregation function
const sumFn = defaultRegistry.get('sum')
const total = sumFn(columnId, rows)

// Get configuration for a function
const config = defaultRegistry.getConfig('percentile')
```

### Creating a Custom Registry

```typescript
import { createRegistry, sumAggregation } from '../components/data-table/aggregation'

// Create a new registry with built-in functions
const registry = createRegistry()

// Register a custom function
registry.register('customSum', sumAggregation, { 
  label: 'Custom Sum', 
  description: 'My custom sum implementation' 
})
```

### Creating Custom Aggregation Functions

```typescript
import { AggregationFunction } from '../components/data-table/aggregation'

// Create a custom aggregation function
const customAggregation: AggregationFunction = (columnId, leafRows) => {
  // Implementation...
  return result
}

// Use with registry
registry.register('custom', customAggregation)
```

## Available Aggregation Functions

### Basic
- `sum`: Sum of numeric values
- `mean`: Average (arithmetic mean) of values
- `min`: Minimum value
- `max`: Maximum value
- `count`: Count of rows

### Statistical
- `median`: Middle value
- `stdDev`: Standard deviation
- `percentile`: Nth percentile (requires config)
- `weightedAvg`: Weighted average (requires config)

### Grouping
- `unique`: List of unique values
- `uniqueCount`: Count of unique values
- `mode`: Most frequent value
- `range`: Range as "min - max" string

### Text
- `first`: First value in group
- `join`: Join values with separator (requires config)
- `last`: Last value in group 