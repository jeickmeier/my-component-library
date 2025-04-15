"use client";

import * as React from "react";
import { format, addBusinessDays } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Preset configuration for single dates
const datePresets = [
  {
    label: "1D",
    getDate: () => addBusinessDays(new Date(), -1),
  },
  {
    label: "FY",
    getDate: () => {
      const today = new Date();
      return new Date(today.getFullYear(), 3, 1); // April 1st of current year
    },
  },
];

// Month names for the dropdown
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (date: Date | undefined) => void;
  defaultDate?: Date;
}

export function DatePicker({
  className,
  onDateChange,
  defaultDate,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate);
  const [month, setMonth] = React.useState<Date>(defaultDate || new Date());

  // Generate years for dropdown (current year - 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Handle date selection
  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateChange?.(newDate);
    if (newDate) {
      setMonth(newDate);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    const newDate = preset.getDate();
    setDate(newDate);
    onDateChange?.(newDate);
    setMonth(newDate);
  };

  // Handle month change
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(monthIndex));
    setMonth(newDate);
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  // Navigate to previous/next month
  const goToPreviousMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(month.getMonth() - 1);
    setMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(month.getMonth() + 1);
    setMonth(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "LLL dd, y") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="p-3">
              <div className="flex items-center gap-1 mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1 flex-1">
                  <Select
                    value={month.getMonth().toString()}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((monthName, index) => (
                        <SelectItem key={monthName} value={index.toString()}>
                          {monthName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={month.getFullYear().toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="h-8 w-[90px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToNextMonth}
                  disabled={
                    month.getMonth() === new Date().getMonth() &&
                    month.getFullYear() === new Date().getFullYear()
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonth}
                disabled={{ after: new Date() }}
                initialFocus
              />
            </div>
            <div className="flex flex-col p-3 border-t gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Quick select:
                </span>
                {datePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
