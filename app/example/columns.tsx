"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { createMoneyRenderer, createCategoryRenderer, createStarRatingRenderer, createDateRenderer, createExtentRenderer } from "@/components/data-table/ui/cell-renderers"
import { CheckCircle, Clock, RefreshCcw, XCircle } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  reviewRating: number
  reviewDate: Date
}

const columnHelper = createColumnHelper<Payment>();

// Create reusable renderers with proper typing
const moneyRenderer = createMoneyRenderer<Payment>({ digits: 2, showCurrencySymbol: false });
const moneyAggregatedRenderer = createMoneyRenderer<Payment>({ digits: 1, abbreviate: true, abbreviationDivider: 'B' });

// Example using icons
const iconCategoryRenderer = createCategoryRenderer<Payment, Payment['status']>({
  categories: {
    pending: { 
      type: 'icon',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
    },
    processing: { 
      type: 'icon',
      icon: <RefreshCcw className="h-4 w-4 text-blue-500" />
    },
    success: { 
      type: 'icon',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    failed: { 
      type: 'icon',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    }
  }
});

const starRenderer = createStarRatingRenderer<Payment>();
const dateRenderer = createDateRenderer<Payment>();
const extentRenderer = createExtentRenderer<Payment>();

export const columns = [
  columnHelper.accessor('status', {
    header: "Status",
    enableGrouping: true,
    filterFn: 'equals',
    meta: {
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ]
    },    
    aggregationFn: 'first',
    cell: (props) => iconCategoryRenderer({ cell: props.cell, row: props.row, value: props.getValue() })
  }),
  columnHelper.accessor('email', {
    header: "Email",
    enableGrouping: true,
  }),
  columnHelper.accessor('amount', {
    header: "Amount",
    enableGrouping: false,
    filterFn: 'numberRange',
    aggregationFn: 'first',
    cell: (props) => moneyRenderer({ cell: props.cell, row: props.row, value: props.getValue() }),
    aggregatedCell: (props) => moneyAggregatedRenderer({ cell: props.cell, row: props.row, value: props.getValue() })
  }),
  columnHelper.accessor('reviewRating', {
    header: "Rating",
    enableGrouping: false,
    aggregationFn: 'mean',
    filterFn: 'starRating',
    meta: {
      maxStars: 5
    },
    cell: (props) => starRenderer({ cell: props.cell, row: props.row, value: props.getValue() }),
    aggregatedCell: (props) => starRenderer({ cell: props.cell, row: props.row, value: props.getValue() })
  }),
  columnHelper.accessor('reviewDate', {
    header: "Review Date",
    enableGrouping: false,
    aggregationFn: 'extent',
    cell: (props) => dateRenderer({ cell: props.cell, row: props.row, value: props.getValue() }),
    aggregatedCell: (props) => extentRenderer({ cell: props.cell, row: props.row, value: props.getValue() })
  })
];
