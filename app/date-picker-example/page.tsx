"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { DatePickerWithRange } from "@/components/date-picker/date-picker-with-range"
import { DatePicker } from "@/components/date-picker/date-picker"
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

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(today)

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-2xl font-semibold mb-6">Date Picker Examples</h1>
            
            <div className="space-y-6">
                <section className="p-6 border rounded-lg bg-card">
                    <h2 className="text-xl font-medium mb-4">Date Range Picker</h2>
                    <DatePickerWithRange 
                        onDateChange={setDateRange} 
                        defaultFrom={thirtyDaysAgo}
                        defaultTo={today}
                    />
                    
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected Range:</h3>
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <p className="text-sm">From <span className="font-medium">{format(dateRange.from, "PPP")}</span> to <span className="font-medium">{format(dateRange.to, "PPP")}</span></p>
                            ) : (
                                <p className="text-sm">Start date: <span className="font-medium">{format(dateRange.from, "PPP")}</span></p>
                            )
                        ) : (
                            <p className="text-sm text-muted-foreground">No date range selected</p>
                        )}
                    </div>
                </section>

                <section className="p-6 border rounded-lg bg-card">
                    <h2 className="text-xl font-medium mb-4">Single Date Picker</h2>
                    <div className="space-y-4">
                        <DatePicker defaultDate={selectedDate} onDateChange={setSelectedDate} />
                        
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected Date:</h3>
                            {selectedDate ? (
                                <p className="text-sm">Selected date: <span className="font-medium">{format(selectedDate, "PPP")}</span></p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No date selected</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}