"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { DayClickEventHandler } from "react-day-picker"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Define types for the workout data structure
interface WorkoutSet {
  value: string;
  notes?: string;
}

interface ExerciseWorkout {
  date: string;
  sets: WorkoutSet[];
  defaultValues: {
    reps: number;
    weight: number;
    weightStep: string;
  };
}

interface WorkoutData {
  [exerciseName: string]: ExerciseWorkout[];
}

interface WorkoutDetail {
  exerciseName: string;
  sets: Array<{
    value: string;
    notes?: string;
  }>;
}

interface WorkoutInfo {
  totalWeight: number;
  details: WorkoutDetail[];
}

export function CalendarDemo() {
  const [markedDates, setMarkedDates] = React.useState<Date[]>([])
  const [workoutData, setWorkoutData] = React.useState<{ [key: string]: WorkoutInfo }>({})
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedWorkoutInfo, setSelectedWorkoutInfo] = React.useState<{ date: string, info: WorkoutInfo } | null>(null)

  React.useEffect(() => {
    // Load workout data from localStorage
    const workoutData = localStorage.getItem('workoutData')
    if (!workoutData) return

    const data = JSON.parse(workoutData) as WorkoutData
    const workoutDates = new Set<string>()
    const weightByDate: { [key: string]: WorkoutInfo } = {}

    // Collect all unique dates from all exercises
    Object.entries(data).forEach(([exerciseName, exercises]) => {
      exercises.forEach((workout) => {
        workoutDates.add(workout.date)

        // Calculate total weight for this workout
        const workoutWeight = workout.sets.reduce((total: number, set) => {
          const value = typeof set === 'string' ? set : set.value
          const [reps, weight] = value.split('x').map(Number)
          return total + (reps * weight)
        }, 0)

        // Add to the date's total
        if (!weightByDate[workout.date]) {
          weightByDate[workout.date] = { totalWeight: 0, details: [] }
        }
        weightByDate[workout.date].totalWeight += workoutWeight
        weightByDate[workout.date].details.push({
          exerciseName,
          sets: workout.sets
        })
      })
    })

    // Convert DD.MM dates to Date objects for the current year
    const currentYear = new Date().getFullYear()
    const dates = Array.from(workoutDates).map(dateStr => {
      const [day, month] = dateStr.split('.').map(Number)
      return new Date(currentYear, month - 1, day)
    })

    setMarkedDates(dates)
    setWorkoutData(weightByDate)
  }, [])

  // Custom modifier for workout dates
  const modifiers = {
    workout: markedDates
  }

  // We can remove the inline styles since we're using CSS classes
  const modifiersClassNames = {
    workout: 'rdp-day_workout'
  }

  // Removed the unused 'modifiers' parameter
  const handleDayClick: DayClickEventHandler = (day) => {
    // Format the date with zero-padding for day and month
    const formattedDate = `${String(day.getDate()).padStart(2, '0')}.${String(day.getMonth() + 1).padStart(2, '0')}`
    const workoutInfo = workoutData[formattedDate]

    console.log(`Clicked date: ${formattedDate}`)
    console.log(`Workout info:`, workoutInfo)

    if (workoutInfo) {
      setSelectedWorkoutInfo({ date: formattedDate, info: workoutInfo })
      setDialogOpen(true)
    }
  }

  return (
    <div className="w-full flex flex-col items-center border border-accent rounded-lg p-4 pb-8">
      <h2 className="flex w-full text-lg font-semibold mb-4">Last Workouts</h2>
      <Calendar
        mode="single"
        className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px]"
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onDayClick={handleDayClick}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[70vh]">
          <DialogHeader>
            <DialogTitle>Workout Details</DialogTitle>
          </DialogHeader>

          {selectedWorkoutInfo && (
            <div className="p-4 h-full overflow-y-auto">
              <DialogDescription>
                Date: <b>{selectedWorkoutInfo.date}</b> 
                <br />
                Total Weight: <b>{selectedWorkoutInfo.info.totalWeight}kg</b>
              </DialogDescription>

              <div>
                {selectedWorkoutInfo.info.details.map((detail, index) => (
                  <div key={index} className="mt-2">
                    <h4 className="font-semibold">{detail.exerciseName}</h4>
                    <ul className="list-disc pl-5">
                      {detail.sets.map((set, setIndex) => (
                        <li key={setIndex}>
                          {set.value} {set.notes && `- ${set.notes}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
