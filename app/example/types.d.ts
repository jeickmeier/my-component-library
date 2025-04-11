import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface AggregationFns {
    first: true;
  }
}
