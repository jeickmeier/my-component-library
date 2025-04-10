"use client"

import React from "react"
import { Payment, columns } from "./columns"
import { DataTable } from "../components/data-table"
import { paymentData } from "./payment-data"

// Use imported payment data
const data: Payment[] = paymentData

export default function DemoPage() {
  // Pre-define all values needed for the DataTable props
  const columnFilters = React.useMemo(() => {
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
    
    return [statusFilter, amountFilter];
  }, []);
  
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
