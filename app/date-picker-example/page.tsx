"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { DatePickerWithRange } from "@/components/date-picker/date-picker-with-range"
import type { DateRange } from "react-day-picker"

export default function DemoPage() {
    // Set default dates (30 days ago to today)
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    
    // Initialize dateRange state with default values
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: thirtyDaysAgo,
        to: today
    })

    return (
        <div className="p-6 space-y-4">
            <DatePickerWithRange 
                onDateChange={setDateRange} 
                defaultFrom={thirtyDaysAgo}
                defaultTo={today}
            />
            
            <div className="mt-4 p-4 border rounded-md bg-muted/20">
                <h3 className="font-medium mb-2">Selected Date Range:</h3>
                {dateRange?.from ? (
                    dateRange.to ? (
                        <p>From <span className="font-medium">{format(dateRange.from, "PPP")}</span> to <span className="font-medium">{format(dateRange.to, "PPP")}</span></p>
                    ) : (
                        <p>Start date: <span className="font-medium">{format(dateRange.from, "PPP")}</span></p>
                    )
                ) : (
                    <p className="text-muted-foreground">No date range selected</p>
                )}
            </div>
        </div>
    )
}