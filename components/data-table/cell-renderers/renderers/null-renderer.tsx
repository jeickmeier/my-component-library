import React from "react";
import { BaseRendererConfig, CellRendererProps } from "../core/types";

/**
 * A renderer that simply returns null
 * Useful for hiding columns in certain views or conditions
 * @returns null
 */
export function nullRenderer(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: CellRendererProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __?: BaseRendererConfig
): React.ReactNode {
  return null;
} 