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
        columns={columns as ColumnDef<Payment>[]}
        data={data}
        enableGrouping={true}
        defaultGrouping={["status","category"]}
        defaultPageSize={50}
        containerHeight="70vh" 
        defaultExpanded={1}
      />
    </div>
  );
}
