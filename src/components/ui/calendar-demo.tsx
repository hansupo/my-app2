"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { DayModifiers } from "react-day-picker"

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [markedDates, setMarkedDates] = React.useState<Date[]>([])

  React.useEffect(() => {
    // Load workout data from localStorage
    const workoutData = localStorage.getItem('workoutData')
    if (!workoutData) return

    const data = JSON.parse(workoutData)
    const workoutDates = new Set<string>()

    // Collect all unique dates from all exercises
    Object.values(data).forEach((exercises: any) => {
      exercises.forEach((workout: any) => {
        workoutDates.add(workout.date)
      })
    })

    // Convert DD.MM dates to Date objects for the current year
    const currentYear = new Date().getFullYear()
    const dates = Array.from(workoutDates).map(dateStr => {
      const [day, month] = dateStr.split('.').map(Number)
      return new Date(currentYear, month - 1, day)
    })

    setMarkedDates(dates)
  }, [])

  // Custom modifier for workout dates
  const modifiers = {
    workout: markedDates
  }

  // We can remove the inline styles since we're using CSS classes
  const modifiersClassNames = {
    workout: 'rdp-day_workout'
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border border-accent w-min shadow"
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
    />
  )
}
