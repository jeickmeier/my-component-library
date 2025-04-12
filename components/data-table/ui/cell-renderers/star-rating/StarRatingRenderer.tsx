import * as React from "react";
import { CellRenderer, RatingOptions } from "../types";

const StarRatingComponent = ({ value, options }: { value: number; options: RatingOptions }) => {
  const {
    maxStars = 5,
    starChar = "★",
    emptyChar = "☆",
    showNumeric = true,
    starClassName = "text-yellow-500",
    emptyStarClassName = "text-gray-300",
    digits = 1
  } = options;

  const filledStars = Math.round(Math.min(Math.max(value, 0), maxStars));
  const emptyStars = maxStars - filledStars;

  return (
    <div className="flex items-center">
      <span className={starClassName}>{starChar.repeat(filledStars)}</span>
      <span className={emptyStarClassName}>{emptyChar.repeat(emptyStars)}</span>
      {showNumeric && <span className="ml-2">{value.toFixed(digits)}/{maxStars}</span>}
    </div>
  );
};
StarRatingComponent.displayName = 'StarRatingComponent';

export function createStarRatingRenderer<TData>(options: RatingOptions = {}): CellRenderer<TData, number> {
  const StarRatingRenderer = ({ value }: { value: number | null }) => 
    value == null ? null : <StarRatingComponent value={value} options={options} />;
  StarRatingRenderer.displayName = 'StarRatingRenderer';
  return StarRatingRenderer;
} 