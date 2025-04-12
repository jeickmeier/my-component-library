import * as React from "react";
import { CellRenderer, CategoryOptions } from "../types";

const CategoryComponent = <TCategory extends string>({ 
  value, 
  options 
}: { 
  value: TCategory | null; 
  options: CategoryOptions<TCategory> 
}) => {
  if (!value || !options.categories[value]) return String(value);

  const {
    categories,
    capitalize = true,
    className = "flex items-center",
    dotClassName = "mr-2 h-2 w-2 rounded-full",
  } = options;

  const category = categories[value];
  const displayText = category.label || (capitalize ? value.charAt(0).toUpperCase() + value.slice(1) : value);

  return (
    <div className={className}>
      {category.type === 'icon' ? (
        <span className="mr-2">{category.icon}</span>
      ) : (
        <span className={`${dotClassName} ${category.color}`} />
      )}
      <span>{displayText}</span>
    </div>
  );
};
CategoryComponent.displayName = 'CategoryComponent';

export function createCategoryRenderer<TData, TCategory extends string>(
  options: CategoryOptions<TCategory>
): CellRenderer<TData, TCategory> {
  const CategoryRenderer = ({ value }: { value: TCategory | null }) => (
    <CategoryComponent value={value} options={options} />
  );
  CategoryRenderer.displayName = 'CategoryRenderer';
  return CategoryRenderer;
} 