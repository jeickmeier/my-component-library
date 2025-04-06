import { AggregationFunction } from "../core"

/**
 * Sum aggregation function
 */
export const sumAggregation: AggregationFunction = (columnId, leafRows) => {
  let sum = 0
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      sum += value
    }
  })
  return sum
}

/**
 * Average aggregation function
 */
export const avgAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const sum = sumAggregation(columnId, leafRows, childRows, config)
  return leafRows.length ? sum : 0
}

/**
 * Min aggregation function
 */
export const minAggregation: AggregationFunction = (columnId, leafRows) => {
  let min: number | null = null
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      min = min === null ? value : Math.min(min, value)
    }
  })
  return min
}

/**
 * Max aggregation function
 */
export const maxAggregation: AggregationFunction = (columnId, leafRows) => {
  let max: number | null = null
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      max = max === null ? value : Math.max(max, value)
    }
  })
  return max
}

/**
 * Count aggregation function
 */
export const countAggregation: AggregationFunction = (_, leafRows) => {
  return leafRows.length
}

/**
 * Range aggregation function
 */
export const rangeAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const min = minAggregation(columnId, leafRows, childRows, config)
  const max = maxAggregation(columnId, leafRows, childRows, config)
  if (min === null || max === null) return null
  return `${min} - ${max}`
}

/**
 * Unique values aggregation function
 */
export const uniqueAggregation: AggregationFunction = (columnId, leafRows) => {
  const uniqueValues = new Set<unknown>()
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      uniqueValues.add(value)
    }
  })
  return Array.from(uniqueValues)
}

/**
 * Unique count aggregation function
 */
export const uniqueCountAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const uniqueValues = uniqueAggregation(columnId, leafRows, childRows, config) as unknown[]
  return uniqueValues.length
}

/**
 * Median aggregation function
 */
export const medianAggregation: AggregationFunction = (columnId, leafRows) => {
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })

  if (!values.length) return null
  
  values.sort((a, b) => a - b)
  const mid = Math.floor(values.length / 2)
  
  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid]
} 