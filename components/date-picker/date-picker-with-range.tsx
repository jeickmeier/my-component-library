"use client"

import * as React from "react"
import { format, parseISO,startOfMonth, startOfYear, startOfQuarter, setMonth, setYear, getYear, getMonth, addMonths, addBusinessDays } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Preset configuration
const rollingDateRangePresets = [
  {
    label: "1D",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const yesterday = addBusinessDays(today, -1)
      return { from: yesterday, to: today }
    },
  },
  {
    label: "MTD",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const mtd = startOfMonth(today)
      return { from: mtd, to: today }
    },
  },
  {
    label: "QTD",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const qtd = startOfQuarter(today)
      return { from: qtd, to: today }
    },
  },
  {
    label: "YTD",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const ytd = startOfYear(today)
      return { from: ytd, to: today }
    },
  },
  {
    label: "FYTD",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const fytd = new Date(today.getFullYear() - 1, 2, 31) // March 31st of previous year
      return { from: fytd, to: today }
    },
  },
  {
    label: "3Y",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const threeYearsAgo = new Date(today)
      threeYearsAgo.setFullYear(today.getFullYear() - 3)
      return { from: threeYearsAgo, to: today }
    },
  },
  {
    label: "5Y",
    getDateRange: () => {
      const today = addBusinessDays(new Date(), -1)
      const fiveYearsAgo = new Date(today)
      fiveYearsAgo.setFullYear(today.getFullYear() - 5)
      return { from: fiveYearsAgo, to: today }
    },
  },
]

const absoluteDateRangePresets = [
  {
    label: "F20",
    getDateRange: () => {
      const start = parseISO("2019-03-31")
      const end = parseISO("2020-03-31")
      return { from: start, to: end }
    },
  },
  {
    label: "F21",
    getDateRange: () => {
      const startOf2020 = parseISO("2020-03-31")
      const endOf2020 = parseISO("2021-03-31")
      return { from: startOf2020, to: endOf2020 }
    },
  },
  {
    label: "F22",
    getDateRange: () => {
      const startOf2021 = parseISO("2021-03-31")
      const endOf2021 = parseISO("2022-03-31")
      return { from: startOf2021, to: endOf2021 }
    },
  },
  {
    label: "F23",
    getDateRange: () => {
      const startOf2022 = parseISO("2022-03-31")
      const endOf2022 = parseISO("2023-03-31")
      return { from: startOf2022, to: endOf2022 }
    },
  },
  {
    label: "F24",
    getDateRange: () => {
      const startOfF23 = parseISO("2023-03-31")
      const endOfF23 = parseISO("2024-03-31")
      return { from: startOfF23, to: endOfF23 }
    },
  },
  {
    label: "F25",
    getDateRange: () => {
      const startOfF24 = parseISO("2024-03-31")
      const endOfF24 = parseISO("2025-03-31")
      return { from: startOfF24, to: endOfF24 }
    },
  },
  {
    label: "F26",
    getDateRange: () => {
      const startOfF25 = parseISO("2025-03-31")
      const endOfF25 = parseISO("2026-03-31")
      return { from: startOfF25, to: endOfF25 }
    },
  },
]

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
]

export interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (date: DateRange | undefined) => void
  defaultFrom?: Date
  defaultTo?: Date
}

export function DatePickerWithRange({ className, onDateChange, defaultFrom, defaultTo }: DatePickerWithRangeProps) {
  // Initialize with provided defaults or fall back to 7D preset
  const initialDateRange = defaultFrom ? 
    { from: defaultFrom, to: defaultTo || undefined } : 
    rollingDateRangePresets[1].getDateRange();
  
  const [date, setDate] = React.useState<DateRange | undefined>(initialDateRange)

  // Track the months displayed in each calendar
  const [leftMonth, setLeftMonth] = React.useState<Date>(initialDateRange.from)
  const [rightMonth, setRightMonth] = React.useState<Date>(initialDateRange.to || new Date())

  // Generate years for dropdown (current year - 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

  // Handle date selection
  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    onDateChange?.(newDate)

    // Update calendar views to show the selected range
    if (newDate?.from) {
      setLeftMonth(newDate.from)
    }

    if (newDate?.to) {
      setRightMonth(newDate.to)
    } else if (newDate?.from) {
      // If only from is selected, show it in both calendars
      setRightMonth(newDate.from)
    }
  }

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof rollingDateRangePresets)[0] | (typeof absoluteDateRangePresets)[0]) => {
    const newRange = preset.getDateRange()
    setDate(newRange)
    onDateChange?.(newRange)

    // Update both calendars to show the start and end dates
    setLeftMonth(newRange.from)
    setRightMonth(newRange.to || newRange.from)
  }

  // Handle left calendar month change
  const handleLeftMonthChange = (monthIndex: string) => {
    const newDate = setMonth(leftMonth, Number.parseInt(monthIndex))
    setLeftMonth(newDate)
  }

  // Handle left calendar year change
  const handleLeftYearChange = (year: string) => {
    const newDate = setYear(leftMonth, Number.parseInt(year))
    setLeftMonth(newDate)
  }

  // Handle right calendar month change
  const handleRightMonthChange = (monthIndex: string) => {
    const newDate = setMonth(rightMonth, Number.parseInt(monthIndex))
    setRightMonth(newDate)
  }

  // Handle right calendar year change
  const handleRightYearChange = (year: string) => {
    const newDate = setYear(rightMonth, Number.parseInt(year))
    setRightMonth(newDate)
  }

  // Navigate to previous/next month
  const goToPreviousMonth = (isLeft: boolean) => {
    if (isLeft) {
      setLeftMonth(addMonths(leftMonth, -1))
    } else {
      setRightMonth(addMonths(rightMonth, -1))
    }
  }

  const goToNextMonth = (isLeft: boolean) => {
    if (isLeft) {
      setLeftMonth(addMonths(leftMonth, 1))
    } else {
      setRightMonth(addMonths(rightMonth, 1))
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="flex p-3 gap-4">
              <div className="border-r pr-4">
                <div className="flex items-center gap-1 mb-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPreviousMonth(true)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1 flex-1">
                    <Select value={getMonth(leftMonth).toString()} onValueChange={handleLeftMonthChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={getYear(leftMonth).toString()} onValueChange={handleLeftYearChange}>
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
                    onClick={() => goToNextMonth(true)}
                    disabled={
                      getMonth(leftMonth) === getMonth(new Date()) && getYear(leftMonth) === getYear(new Date())
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleSelect}
                  month={leftMonth}
                  onMonthChange={setLeftMonth}
                  numberOfMonths={1}
                  disabled={{ after: new Date() }}
                  initialFocus
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPreviousMonth(false)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1 flex-1">
                    <Select value={getMonth(rightMonth).toString()} onValueChange={handleRightMonthChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={getYear(rightMonth).toString()} onValueChange={handleRightYearChange}>
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
                    onClick={() => goToNextMonth(false)}
                    disabled={
                      getMonth(rightMonth) === getMonth(new Date()) && getYear(rightMonth) === getYear(new Date())
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleSelect}
                  month={rightMonth}
                  onMonthChange={setRightMonth}
                  numberOfMonths={1}
                  disabled={{ after: new Date() }}
                />
              </div>
            </div>
            <div className="flex flex-col p-3 border-t gap-2">
              <div className="flex items-center justify-start gap-2">
                <span className="text-xs text-muted-foreground mr-1">Rolling:</span>
                {rollingDateRangePresets.map((preset, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => handlePresetSelect(preset)}>
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-start gap-2">
                <span className="text-xs text-muted-foreground mr-1">Fiscal Years:</span>
                {absoluteDateRangePresets.map((preset, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => handlePresetSelect(preset)}>
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

