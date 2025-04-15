"use client";

import React from "react";
import { Payment, columns } from "./columns";
import { DataTable } from "@/components/data-table/core/DataTable";
import { paymentData } from "./payment-data";
import { ColumnDef } from "@tanstack/react-table";

// Use imported payment data
const data: Payment[] = paymentData;

export default function DemoPage() {
  return (
    <div className="container mx-auto py-5">
      <DataTable
        // Core Options
        columns={columns as ColumnDef<Payment>[]}
        data={data}
        // Grouping Options
        enableGrouping={true}
        defaultGrouping={["status", "category"]}
        defaultExpanded={1}
        // Formatting Options
        defaultPageSize={50}
        containerHeight="70vh"
      />
    </div>
  );
}
