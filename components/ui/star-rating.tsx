import React, { useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui path alias

interface StarRatingProps {
  /** The rating value (e.g., 4.5) */
  rating: number;
  /** The maximum rating value (default: 5) */
  maxRating?: number;
  /** Custom className for styling the container */
  className?: string;
  /** Style object for the container */
  style?: React.CSSProperties;
  /** Whether to show tooltip (default: true) */
  showTooltip?: boolean;
  /** Whether to use external TooltipProvider (default: false) */
  externalProvider?: boolean;
}

/**
 * Displays a visual star rating based on a numeric value, using shadcn/ui Tooltip.
 */
export const StarRating: React.FC<StarRatingProps> = React.memo(({
  rating,
  maxRating = 5,
  className = '',
  style,
  showTooltip = true,
  externalProvider = false,
}) => {
  const starColor = style?.color || '#facc15'; // Use provided color or default
  
  const { stars, tooltipText } = useMemo(() => {
    const fullStars = Math.floor(rating);
    // Use a small epsilon for floating point comparison
    const hasHalfStar = rating % 1 >= 0.49; // Check if remainder is close to 0.5 or more
    const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

    // Ensure values are non-negative
    const validFullStars = Math.max(0, fullStars);
    const validEmptyStars = Math.max(0, emptyStars);
    // Only show half star if rating is actually between 0 and max
    const validHasHalfStar = hasHalfStar && rating > 0 && rating < maxRating;

    const starsArray = [];

    // Add full stars
    for (let i = 0; i < validFullStars; i++) {
      starsArray.push(<span key={`full-${i}`} style={{ color: starColor }}>★</span>);
    }

    // Add half star using CSS gradient technique
    if (validHasHalfStar) {
      const halfStarStyle: React.CSSProperties = {
        display: 'inline-block', // Needed for background clip
        position: 'relative',
        color: 'transparent', // Make the text character transparent
        background: `linear-gradient(to right, ${starColor} 50%, #ccc 50%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        lineHeight: '1em',
      };
      starsArray.push(<span key="half" style={halfStarStyle}>★</span>);
    }

    // Add empty stars
    for (let i = 0; i < validEmptyStars; i++) {
      starsArray.push(<span key={`empty-${i}`} style={{ color: '#ccc' }}>☆</span>);
    }

    // Handle edge case: rating is 0
    if (rating <= 0 && maxRating > 0) {
      starsArray.length = 0; // Clear any potentially added stars
      for (let i = 0; i < maxRating; i++) {
        starsArray.push(<span key={`zero-empty-${i}`} style={{ color: '#ccc' }}>☆</span>);
      }
    }

    return {
      stars: starsArray,
      tooltipText: `Rating: ${rating.toFixed(1)} / ${maxRating}`
    };
  }, [rating, maxRating, starColor]);

  const starsContent = (
    <div
      className={`star-rating ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'default', ...style }}
    >
      {stars}
    </div>
  );

  if (!showTooltip) {
    return starsContent;
  }

  const tooltipElement = (
    <Tooltip>
      <TooltipTrigger asChild>
        {starsContent}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );

  if (externalProvider) {
    return tooltipElement;
  }

  return (
    <TooltipProvider delayDuration={100}>
      {tooltipElement}
    </TooltipProvider>
  );
});

StarRating.displayName = 'StarRating';

export default StarRating;
