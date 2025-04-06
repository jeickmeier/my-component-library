import React from 'react';
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
}

/**
 * Displays a visual star rating based on a numeric value, using shadcn/ui Tooltip.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  className = '',
  style,
}) => {
  const fullStars = Math.floor(rating);
  // Use a small epsilon for floating point comparison
  const hasHalfStar = rating % 1 >= 0.49; // Check if remainder is close to 0.5 or more
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  // Ensure values are non-negative
  const validFullStars = Math.max(0, fullStars);
  const validEmptyStars = Math.max(0, emptyStars);
  // Only show half star if rating is actually between 0 and max
  const validHasHalfStar = hasHalfStar && rating > 0 && rating < maxRating;

  const stars = [];
  const starColor = style?.color || '#facc15'; // Use provided color or default

  // Add full stars
  for (let i = 0; i < validFullStars; i++) {
    stars.push(<span key={`full-${i}`} style={{ color: starColor }}>★</span>);
  }

  // Add half star using CSS gradient technique
  if (validHasHalfStar) {
     const halfStarStyle: React.CSSProperties = {
        display: 'inline-block', // Needed for background clip
        position: 'relative', // Needed for positioning if using pseudo-elements (not used here but good practice)
        color: 'transparent', // Make the text character transparent
        background: `linear-gradient(to right, ${starColor} 50%, #ccc 50%)`, // Gradient: half colored, half gray
        WebkitBackgroundClip: 'text', // Clip the background to the text shape (Chrome, Safari)
        backgroundClip: 'text', // Standard syntax
        lineHeight: '1em', // Ensure proper alignment
     };
    stars.push(<span key="half" style={halfStarStyle}>★</span>); // Use a full star character but clip its background
  }

  // Add empty stars
  for (let i = 0; i < validEmptyStars; i++) {
     // Use a lighter color for empty stars, like gray
    stars.push(<span key={`empty-${i}`} style={{ color: '#ccc' }}>☆</span>);
  }

  // Handle edge case: rating is 0
  if (rating <= 0 && maxRating > 0) {
     stars.length = 0; // Clear any potentially added stars
     for (let i = 0; i < maxRating; i++) {
        stars.push(<span key={`zero-empty-${i}`} style={{ color: '#ccc' }}>☆</span>);
     }
  }

  const tooltipText = `Rating: ${rating.toFixed(1)} / ${maxRating}`;

  // Important: TooltipProvider should ideally wrap your application or a larger
  // section where tooltips are used. Placing it here works for an isolated component
  // but might be redundant if already present higher up the component tree.
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
           {/* The trigger is the element that shows the tooltip on hover */}
          <div
             className={`star-rating ${className}`}
             style={{ display: 'inline-flex', alignItems: 'center', cursor: 'default', ...style }} // Added cursor
          >
            {stars}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StarRating;
