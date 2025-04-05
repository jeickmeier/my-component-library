"use client"

import React from "react"
import { Payment, columns } from "./columns"
import { DataTable } from "../components/data-table"

// Mock data directly in the component
const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "john@example.com",
  },
  {
    id: "63d91c4b",
    amount: 75,
    status: "success",
    email: "sara@example.com",
  },
  {
    id: "a9f87e35",
    amount: 200,
    status: "failed",
    email: "mike@example.com",
  },
  {
    id: "5e29d3b1",
    amount: 150,
    status: "success",
    email: "lisa@example.com",
  },
  {
    id: "b3c17fd8",
    amount: 50,
    status: "pending",
    email: "chris@example.com",
  },
  {
    id: "7d4e2f19",
    amount: 175,
    status: "processing",
    email: "alex@example.com",
  },
  {
    id: "91a56c3e",
    amount: 225,
    status: "success",
    email: "emma@example.com",
  },
  {
    id: "42b8f7d1",
    amount: 300,
    status: "failed",
    email: "david@example.com",
  },
  {
    id: "e67c9a45",
    amount: 80,
    status: "pending",
    email: "sophia@example.com",
  }
]

export default function DemoPage() {
  // Pre-define all values needed for the DataTable props
  const statusFilter = {
    type: 'select' as const,
    column: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Success", value: "success" },
      { label: "Failed", value: "failed" },
    ]
  }

  const amountFilter = {
    type: 'range' as const,
    column: "amount",
    label: "Amount"
  }

  const columnFilters = React.useMemo(() => [statusFilter, amountFilter], []);
  
  // Make all columns available for grouping
  const groupableColumns = React.useMemo(() => ["status", "email", "amount"], []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Data Table with Multi-level Grouping</h1>
      <p className="text-muted-foreground mb-4">
        You can group by multiple columns and drag to reorder them. Try grouping by status, then email to see hierarchical data.
      </p>
      <DataTable 
        columns={columns} 
        data={data} 
        columnFilters={columnFilters}
        enableGrouping={true}
        groupableColumns={groupableColumns}
      />
    </div>
  )
}
