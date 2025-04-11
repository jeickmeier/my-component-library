"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    enableGrouping: true,
    aggregationFn: 'first',
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex items-center">
          <span className={`mr-2 h-2 w-2 rounded-full ${
            status === "pending" ? "bg-yellow-500" :
            status === "processing" ? "bg-blue-500" :
            status === "success" ? "bg-green-500" :
            "bg-red-500"
          }`} />
          <span className="capitalize">{status}</span>
        </div>
      )
    },
    aggregatedCell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex items-center">
          <span className={`mr-2 h-2 w-2 rounded-full ${
            status === "pending" ? "bg-yellow-500" :
            status === "processing" ? "bg-blue-500" :
            status === "success" ? "bg-green-500" :
            "bg-red-500"
          }`} />
          <span className="capitalize">{status} (First)</span>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    enableGrouping: true,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
    filterFn: 'numberRange',
    aggregationFn: 'first',
    aggregatedCell: ({ row }) => {
      const value = row.getValue("amount")
      
      if (value == null) return null
      
      // Format as currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value))
      
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
