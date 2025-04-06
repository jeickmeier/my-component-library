import { AggregationFunction, WeightedAvgAggregationConfig, PercentileAggregationConfig, JoinAggregationConfig } from "../core"

/**
 * Weighted average aggregation
 */
export const weightedAvgAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const weightColumnId = (config as WeightedAvgAggregationConfig)?.weightColumnId
  if (!weightColumnId) {
    return null
  }

  let weightedSum = 0
  let totalWeight = 0

  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    const weight = row.getValue(weightColumnId)
    
    if (typeof value === 'number' && typeof weight === 'number') {
      weightedSum += value * weight
      totalWeight += weight
    }
  })

  return totalWeight ? weightedSum / totalWeight : null
}

/**
 * Mode aggregation function
 */
export const modeAggregation: AggregationFunction = (columnId, leafRows) => {
  const countMap = new Map<unknown, number>()
  
  // Count occurrences
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      countMap.set(value, (countMap.get(value) || 0) + 1)
    }
  })
  
  // Find mode (value with highest count)
  let maxCount = 0
  let mode: unknown = null
  
  countMap.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count
      mode = value
    }
  })
  
  return mode
}

/**
 * Standard deviation aggregation
 */
export const stdDevAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) return null
  
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  
  // Calculate sum of squared differences
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const sumSquaredDiffs = squaredDiffs.reduce((sum, value) => sum + value, 0)
  
  // Calculate standard deviation
  return Math.sqrt(sumSquaredDiffs / values.length)
}

/**
 * Percentile aggregation
 */
export const percentileAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const percentile = (config as PercentileAggregationConfig)?.percentile || 50
  
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Sort values
  values.sort((a, b) => a - b)
  
  // Calculate percentile index
  const index = (percentile / 100) * (values.length - 1)
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)
  
  // Interpolate if needed
  if (lowerIndex === upperIndex) {
    return values[lowerIndex]
  }
  
  const lowerValue = values[lowerIndex]
  const upperValue = values[upperIndex]
  const fraction = index - lowerIndex
  
  return lowerValue + (upperValue - lowerValue) * fraction
}

/**
 * First value aggregation
 */
export const firstAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) {
    return null;
  }
  
  return leafRows[0].getValue(columnId);
}

/**
 * Last value aggregation
 */
export const lastAggregation: AggregationFunction = (columnId, leafRows) => {
  return leafRows.length ? leafRows[leafRows.length - 1].getValue(columnId) : null
}

/**
 * Join values aggregation
 */
export const joinAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const { separator = ', ', limit } = (config as JoinAggregationConfig) || {}
  
  const values: unknown[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Apply limit if specified
  const limitedValues = limit ? values.slice(0, limit) : values
  
  return limitedValues.join(separator)
} 