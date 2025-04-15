"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  createMoneyRenderer,
  createCategoryRenderer,
  createStarRatingRenderer,
  createDateRenderer,
  createExtentRenderer,
  createMultiAggregationRenderer,
} from "@/components/data-table/ui/cell-renderers";
import { CheckCircle, Clock, RefreshCcw, XCircle } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  category: string;
  reviewRating: number;
  reviewDate: Date;
};

const columnHelper = createColumnHelper<Payment>();

// Create reusable renderers with proper typing
const moneyRenderer = createMoneyRenderer<Payment>({
  digits: 2,
  showCurrencySymbol: false,
});
const moneyRendererAggregated = createMoneyRenderer<Payment>({
  digits: 0,
  showCurrencySymbol: true,
  abbreviate: true,
});
const moneyRendererCount = createMoneyRenderer<Payment>({
  digits: 0,
  showCurrencySymbol: false,
});
const iconCategoryRenderer = createCategoryRenderer<Payment, Payment["status"]>(
  {
    categories: {
      pending: {
        type: "icon",
        icon: <Clock className="h-4 w-4 text-yellow-500" />,
      },
      processing: {
        type: "icon",
        icon: <RefreshCcw className="h-4 w-4 text-blue-500" />,
      },
      success: {
        type: "icon",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      },
      failed: {
        type: "icon",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      },
    },
  },
);

const starRenderer = createStarRatingRenderer<Payment>();
const dateRenderer = createDateRenderer<Payment>();
const extentRenderer = createExtentRenderer<Payment>();

const amountAggregatedRenderer = createMultiAggregationRenderer<Payment>({
  numBins: 10,
  height: "h-[40px]",
  formatTooltipValue: (value) => value.toLocaleString("en-US"),
  barColor: "hsl(var(--primary))",
  countRenderer: moneyRendererCount,
  aggregatedRenderer: moneyRendererAggregated,
});

export const columns = [
  columnHelper.accessor("status", {
    header: "Status",
    filterFn: "equals",
    enableGrouping: true,
    meta: {
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ],
    },
    cell: (props) =>
      iconCategoryRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
  }),

  columnHelper.accessor("category", {
    header: "Category",
    enableGrouping: true,
    filterFn: "equals",
    meta: {
      options: [
        { label: "Retail", value: "retail" },
        { label: "Corporate", value: "corporate" },
        { label: "Investment", value: "investment" },
        { label: "Treasury", value: "treasury" },
      ],
    },
  }),

  columnHelper.accessor("email", {
    header: "Email",
    enableGrouping: true,
  }),

  columnHelper.accessor("amount", {
    header: "Amount",
    filterFn: "numberRange",
    meta: {
      filterConfig: {
        type: "rangeSlider",
        column: "amount",
        label: "Amount Range",
      },
    },
    aggregationFn: "sparkline",
    cell: (props) =>
      moneyRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
    aggregatedCell: amountAggregatedRenderer,
  }),

  columnHelper.accessor("reviewRating", {
    header: "Rating",
    aggregationFn: "mean",
    filterFn: "starRating",
    meta: {
      maxStars: 5,
      filterConfig: {
        type: "starRating",
        column: "reviewRating",
        label: "Rating",
        maxStars: 5,
      },
    },
    cell: (props) =>
      starRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
    aggregatedCell: (props) =>
      starRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
  }),

  columnHelper.accessor("reviewDate", {
    header: "Review Date",
    aggregationFn: "extent",
    cell: (props) =>
      dateRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
    aggregatedCell: (props) =>
      extentRenderer({
        cell: props.cell,
        row: props.row,
        value: props.getValue(),
      }),
  }),
];
