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
  DialogHeader,
  DialogTitle,
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
      <DialogHeader hidden>
        <DialogTitle></DialogTitle>
      </DialogHeader>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-1/2"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          {format(selectedDate, "dd.MM")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full p-6 pt-12">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px]"
        />
      </DialogContent>
    </Dialog>
  )
}
