"use client"

import { useEffect, useState } from "react"
import { DataTable, deserializeSchema, DataTableSchema, SerializableDataTableSchema } from "@/components/data-table"
import { getGlobalCellRendererRegistry } from "@/components/data-table/cell-renderers/index"

// TypeScript type for the employee data
type Employee = {
  id: string
  name: string
  department: string
  salary: number
  startDate: string
  status: "active" | "onLeave" | "terminated"
  performance: number
  fullTime: boolean
  projectCount: number
}

// Fetch data from our API endpoint
async function fetchEmployeeData(): Promise<Employee[]> {
  const response = await fetch('/api/employees')
  if (!response.ok) {
    throw new Error('Failed to fetch employee data')
  }
  return response.json()
}

// Fetch schema from our API endpoint
async function fetchEmployeeSchema(schemaName: string): Promise<DataTableSchema<Employee>> {
  const registry = getGlobalCellRendererRegistry();
  
  const response = await fetch(`/api/schemas/${schemaName}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${schemaName}`)
  }
  
  const serialized = await response.json() as SerializableDataTableSchema
  return deserializeSchema<Employee>(serialized, registry)
}

export default function AdvancedTableExample() {
  const [schema, setSchema] = useState<DataTableSchema<Employee> | null>(null)
  const [data, setData] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Load the schema from API with correct type
        const loadedSchema = await fetchEmployeeSchema('advanced-table')
        setSchema(loadedSchema)
        
        // Load the data from API
        const employeeData = await fetchEmployeeData()
        setData(employeeData)
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load schema or data. See console for details.')
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading table data and schema...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  if (!schema) {
    return <div className="p-8">Schema could not be loaded.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Employee Directory</h1>
      <p className="mb-4">
        This table uses a schema loaded from a JSON file and deserialized at runtime.
      </p>
      
      <div className="rounded-lg overflow-hidden">
        <DataTable 
          schema={schema}
          data={data}
        />
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-medium mb-2">About this example:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>The table schema is loaded from a JSON file</li>
          <li>It demonstrates all column types and features</li>
          <li>Try grouping by department or filtering by different criteria</li>
          <li>Notice how cell renderers are automatically applied</li>
        </ul>
      </div>
    </div>
  )
} 