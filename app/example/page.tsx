"use client";

import React from "react";
import { Payment, columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { paymentData } from "./payment-data";
import { ColumnDef } from "@tanstack/react-table";

// Use imported payment data
const data: Payment[] = paymentData;

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">
        Data Table with Multi-level Grouping and Filtering
      </h1>
      <p className="text-muted-foreground mb-4">
        You can group by multiple columns and drag to reorder them. Try grouping
        by status, then email to see hierarchical data.
      </p>
      <p className="text-muted-foreground mb-4">
        Filters are automatically discovered from column definitions with filterFn.
      </p>
      <DataTable
        columns={columns as ColumnDef<Payment>[]}
        data={data}
        enableGrouping={true}
        defaultPageSize={50}
        containerHeight="65vh" 
      />
    </div>
  );
}
