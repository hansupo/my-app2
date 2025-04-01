"use client"

import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface WorkoutSet {
  exerciseName: string;
  date: string;
  sets: string[];
  defaultValues: {
    reps: number;
    weight: number;
    weightStep: string;
  };
}

interface StoredWorkouts {
  [exerciseName: string]: WorkoutSet[];
}

interface GroupedWorkouts {
  [date: string]: {
    exerciseName: string;
    sets: string[];
  }[];
}

const STORAGE_KEY = 'workoutData'

const loadFromLocalStorage = (): StoredWorkouts => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }
  return {}
}

const groupWorkoutsByDate = (workouts: StoredWorkouts): GroupedWorkouts => {
  const grouped: GroupedWorkouts = {}
  
  Object.entries(workouts).forEach(([exerciseName, exerciseWorkouts]) => {
    exerciseWorkouts.forEach(workout => {
      if (!grouped[workout.date]) {
        grouped[workout.date] = []
      }
      grouped[workout.date].push({
        exerciseName,
        sets: workout.sets
      })
    })
  })
  
  return grouped
}

export default function History() {
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({})

  useEffect(() => {
    const storedData = loadFromLocalStorage()
    const grouped = groupWorkoutsByDate(storedData)
    setGroupedWorkouts(grouped)
  }, [])

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => {
    const [dayA, monthA] = a.split('.').map(Number)
    const [dayB, monthB] = b.split('.').map(Number)
    return monthB - monthA || dayB - dayA
  })

  return (
    <main className="flex flex-col items-center justify-between p-4 pt-10">
      <h1 className="text-4xl font-bold mb-8">Workout History</h1>
      
      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {sortedDates.map((date) => (
            <AccordionItem key={date} value={date}>
              <AccordionTrigger className="text-lg font-semibold">
                {date}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {groupedWorkouts[date].map((workout, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{workout.exerciseName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {workout.sets.map((set, setIndex) => (
                          <span
                            key={setIndex}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {set}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  )
} 