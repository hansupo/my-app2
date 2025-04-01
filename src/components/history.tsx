"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WorkoutSet {
  exerciseName: string;
  date: string;
  sets: Array<{
    value: string;
    notes?: string;
  }>;
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
    sets: Array<{
      value: string;
      notes?: string;
    }>;
    volume: number;
  }[];
}

interface HistoryProps {
  onExerciseSelect: (exerciseName: string) => void;
}

const STORAGE_KEY = 'workoutData'

const loadFromLocalStorage = (): StoredWorkouts => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }
  return {}
}

const saveToLocalStorage = (data: StoredWorkouts) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

const calculateVolume = (sets: Array<{ value: string }>) => {
  return sets.reduce((total, set) => {
    const [reps, weight] = set.value.split('x').map(Number);
    return total + (reps * weight);
  }, 0);
};

const groupWorkoutsByDate = (workouts: StoredWorkouts): GroupedWorkouts => {
  const grouped: GroupedWorkouts = {}
  
  Object.entries(workouts).forEach(([exerciseName, exerciseWorkouts]) => {
    exerciseWorkouts.forEach(workout => {
      if (!grouped[workout.date]) {
        grouped[workout.date] = []
      }

      // Handle both old and new data formats
      const sets = workout.sets.map(set => {
        // If set is a string (old format), convert it to new format
        if (typeof set === 'string') {
          return {
            value: set,
            notes: ''
          }
        }
        // If set is already in new format, use it as is
        return set
      })

      grouped[workout.date].push({
        exerciseName,
        sets,
        volume: calculateVolume(sets)
      })
    })
  })
  
  return grouped
}

export function History({ onExerciseSelect }: HistoryProps) {
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<{ date: string; exerciseName: string } | null>(null)

  const loadWorkouts = () => {
    const storedData = loadFromLocalStorage()
    const grouped = groupWorkoutsByDate(storedData)
    setGroupedWorkouts(grouped)
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const handleDelete = () => {
    if (!exerciseToDelete) return

    const storedData = loadFromLocalStorage()
    const { date, exerciseName } = exerciseToDelete

    // Remove the workout from the stored data
    if (storedData[exerciseName]) {
      storedData[exerciseName] = storedData[exerciseName].filter(
        workout => workout.date !== date
      )
      
      // If no workouts left for this exercise, remove the exercise entry
      if (storedData[exerciseName].length === 0) {
        delete storedData[exerciseName]
      }
      
      saveToLocalStorage(storedData)
      loadWorkouts()
    }

    setDeleteDialogOpen(false)
    setExerciseToDelete(null)
  }

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => {
    const [dayA, monthA] = a.split('.').map(Number)
    const [dayB, monthB] = b.split('.').map(Number)
    return monthB - monthA || dayB - dayA
  })

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        {sortedDates.map((date) => (
          <AccordionItem key={date} value={date} className="border-b border-accent">
            <AccordionTrigger className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{date}</span>
                {groupedWorkouts[date].length > 0 && (
                  <span className="ml-2 overflow-hidden text-secondary-foreground">
                    {groupedWorkouts[date].reduce((max, workout) => 
                      workout.volume > max.volume ? workout : max
                    ).exerciseName} day
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupedWorkouts[date].map((workout, index) => (
                  <div key={index} className="bg-transparent p-0 relative">
                    <h3 
                      className="mb-0 cursor-pointer bg-accent/60 hover:text-primary px-4 py-2 border border-b-0 border-accent rounded-t-lg"
                      onClick={() => onExerciseSelect(workout.exerciseName)}
                    >
                      {workout.exerciseName}
                    </h3>
                    <div className="grid grid-cols-5 border border-accent shadow-2xs rounded-b-lg">
                      {workout.sets.map((set, setIndex) => {
                        const totalRows = Math.ceil(workout.sets.length / 5);
                        const currentRow = Math.floor(setIndex / 5);
                        return (
                          <span
                            key={setIndex}
                            className={`text-center text-accent-foreground/50 px-2 py-2 text-sm bg-accent/30
                              ${setIndex % 5 !== 4 ? 'border-r border-accent' : ''}
                              ${currentRow < totalRows - 1 ? 'border-b border-accent' : ''}`}
                          >
                            {set.value}
                          </span>
                        );
                      })}
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-8 w-8"
                          onClick={() => setExerciseToDelete({ date, exerciseName: workout.exerciseName })}
                        >
                          <Trash2 className="h-4 w-4 text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Workout</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this workout? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDelete}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
} 