"use client"

import { DataTable } from "@/components/data-table"
import { useDataTableSource } from "@/components/data-table/hooks/useDataTableSource" // Import the new hook

// TypeScript type for the employee data
// Keep this type definition as it's needed for the hook's generic type
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

// Remove fetchEmployeeData and fetchEmployeeSchema as they are now inside the hook

export default function AdvancedTableExample() {
  // Use the custom hook to get schema, data, loading, and error states
  const { schema, data, loading, error } = useDataTableSource<Employee>(
    'advanced-table', // schemaName
    '/api/employees'  // dataUrl
  )

  // Keep the loading and error handling logic
  if (loading) {
    return <div className="p-8">Loading table data and schema...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  // Check if schema is loaded (it might be null even if not loading/erroring initially)
  if (!schema) {
    return <div className="p-8">Schema could not be loaded.</div>
  }

  // Keep the rendering logic
  return (
    <div className="p-8">
        <div className="rounded-lg overflow-hidden">
          <DataTable
            schema={schema} // Pass schema from the hook
            data={data}     // Pass data from the hook
          />
        </div>
    </div>
  )
} 