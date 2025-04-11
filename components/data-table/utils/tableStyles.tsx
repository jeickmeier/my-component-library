import * as React from "react";

export function useTableStyles() {
  React.useEffect(() => {
    if (!document.getElementById("sticky-group-header-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "sticky-group-header-styles";
      styleSheet.innerHTML = `
        /* Sticky header styling */
        .sticky-table-header {
          position: sticky !important;
          top: 0;
          z-index: 10; 
          background-color: var(--background);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          width: 100%;
        }
        
        /* Ensure dropdowns and tooltips appear above the sticky header */
        [data-state="open"],
        [data-state="delayed-open"] {
          z-index: 9999 !important;
        }
        
        /* Sticky group row styling */
        .sticky-group-header {
          position: sticky !important;
          z-index: 5;
          backdrop-filter: blur(4px);
          background-color: var(--background);
        }
        
        .sticky-group-header:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
          z-index: 1;
        }
        
        /* Container stacking context */
        .virtualized-table-container {
          position: relative;
          z-index: 0;
          overflow: auto;
        }
        
        /* Ensure correct stacking of elements */
        thead {
          z-index: 3;
        }
        
        tbody {
          z-index: 1;
          position: relative;
        }
      `;
      document.head.appendChild(styleSheet);

      return () => {
        const style = document.getElementById("sticky-group-header-styles");
        if (style) document.head.removeChild(style);
      };
    }
  }, []);
}
