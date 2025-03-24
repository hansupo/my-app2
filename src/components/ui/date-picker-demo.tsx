"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DatePickerDemoProps {
  date?: Date;
  onDateChange?: (date?: Date) => void;
}

export function DatePickerDemo({ date, onDateChange }: DatePickerDemoProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(date || new Date())
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (newDate?: Date) => {
    setSelectedDate(newDate || new Date())
    onDateChange?.(newDate)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-center w-1/2 text-center font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto p-2 pt-10">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </DialogContent>
    </Dialog>
  )
}
