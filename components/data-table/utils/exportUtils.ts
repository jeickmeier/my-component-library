import { Table } from "@tanstack/react-table";

/**
 * Convert table data to CSV string
 */
export function tableToCSV<TData>(
  table: Table<TData>,
  includeAllColumns = true
): string {
  // Get headers and rows
  const headers = table.getAllColumns();
  const rows = table.getRowModel().rows;
  const visibleColumns = headers.filter((column) => column.getIsVisible());
  const columnsToUse = includeAllColumns ? headers : visibleColumns;

  // Generate the header row
  const headerRow = columnsToUse
    .map((column) => {
      const headerValue = typeof column.columnDef.header === 'function'
        ? column.columnDef.header.toString()
        : column.columnDef.header || column.id;
      
      return escapeCSVValue(String(headerValue));
    })
    .join(",");

  // Generate data rows
  const dataRows = rows.map((row) => {
    return columnsToUse
      .map((column) => {
        let cellValue;
        try {
          cellValue = row.getValue(column.id);
        } catch {
          cellValue = '';
        }
        return escapeCSVValue(formatCellValueForCSV(cellValue));
      })
      .join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Format cell value for CSV
 */
function formatCellValueForCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  if (typeof value === "object") {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Other objects - convert to JSON string
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Escape CSV value - wrap in quotes if needed and escape quotes
 */
function escapeCSVValue(value: string): string {
  const needsQuotes = value.includes(",") || value.includes("\n") || value.includes('"');
  
  if (needsQuotes) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a blob with the CSV data
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create a download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Add to document, trigger click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 