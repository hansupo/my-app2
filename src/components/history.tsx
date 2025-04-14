"use client"

import { useEffect, useState } from "react"
import { SquareArrowOutUpRight, SquareMousePointer, Trash2, EllipsisVertical, Share2, FileDown, Trash, Save } from "lucide-react"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"

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

interface CustomWorkout {
  name: string;
  date: string;
  exercises: {
    exerciseName: string;
    sets: Array<{
      value: string;
      notes?: string;
    }>;
    volume: number;
  }[];
  lastPerformed?: string;
}

interface CustomWorkoutWithLastPerformed extends CustomWorkout {
  lastPerformed: string;
}

interface HistoryProps {
  onExerciseSelect: (exerciseName: string) => void;
}

const STORAGE_KEY = 'workoutData'
const CUSTOM_WORKOUTS_KEY = 'customWorkouts'

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

const groupWorkoutsByDate = (workouts: StoredWorkouts): { workouts: GroupedWorkouts, customWorkoutsByDate: { [date: string]: string } } => {
  const grouped: GroupedWorkouts = {}

  // First, get all custom workouts to check for duplicates
  const stored = localStorage.getItem(CUSTOM_WORKOUTS_KEY)
  const customWorkouts: CustomWorkout[] = stored ? JSON.parse(stored) : []
  
  // Create a map of date -> custom workout names for quick lookup
  const customWorkoutsByDate: { [date: string]: string } = {}
  const exercisesInCustomWorkouts: { [key: string]: Set<string> } = {}
  
  customWorkouts.forEach(customWorkout => {
    customWorkoutsByDate[customWorkout.date] = customWorkout.name
    
    // Track which exercises are part of this custom workout
    if (!exercisesInCustomWorkouts[customWorkout.date]) {
      exercisesInCustomWorkouts[customWorkout.date] = new Set()
    }
    customWorkout.exercises.forEach(exercise => {
      exercisesInCustomWorkouts[customWorkout.date].add(exercise.exerciseName)
    })
  })

  // Add regular workouts, excluding those that are part of custom workouts
  Object.entries(workouts).forEach(([exerciseName, exerciseWorkouts]) => {
    exerciseWorkouts.forEach(workout => {
      if (!grouped[workout.date]) {
        grouped[workout.date] = []
      }

      // Skip if this exercise is part of a custom workout on this date
      if (exercisesInCustomWorkouts[workout.date]?.has(exerciseName)) {
        return
      }

      const sets = workout.sets.map(set => {
        if (typeof set === 'string') {
          return { value: set, notes: '' }
        }
        return set
      })

      grouped[workout.date].push({
        exerciseName,
        sets,
        volume: calculateVolume(sets)
      })
    })
  })

  // Add custom workouts
  customWorkouts.forEach(customWorkout => {
    if (!grouped[customWorkout.date]) {
      grouped[customWorkout.date] = []
    }
    
    // Add exercises without the custom workout name in parentheses
    customWorkout.exercises.forEach(exercise => {
      grouped[customWorkout.date].push({
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        volume: exercise.volume
      })
    })
  })

  return { workouts: grouped, customWorkoutsByDate }
}

const saveCustomWorkout = (workout: CustomWorkout) => {
  const stored = localStorage.getItem(CUSTOM_WORKOUTS_KEY)
  const customWorkouts = stored ? JSON.parse(stored) : []
  customWorkouts.push(workout)
  localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(customWorkouts))
}

export function History({ onExerciseSelect }: HistoryProps) {
  const [workoutData, setWorkoutData] = useState<{ 
    workouts: GroupedWorkouts, 
    customWorkoutsByDate: { [date: string]: string } 
  }>({ workouts: {}, customWorkoutsByDate: {} })
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkoutWithLastPerformed[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<{ date: string; exerciseName: string } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [customWorkoutName, setCustomWorkoutName] = useState("")
  const [saveWorkoutDialogOpen, setSaveWorkoutDialogOpen] = useState(false)
  const [customWorkoutDrawerOpen, setCustomWorkoutDrawerOpen] = useState(false)
  const [selectedCustomWorkout, setSelectedCustomWorkout] = useState<CustomWorkoutWithLastPerformed | null>(null)
  const [newCustomWorkoutName, setNewCustomWorkoutName] = useState("")

  const loadWorkouts = () => {
    const storedData = loadFromLocalStorage()
    const grouped = groupWorkoutsByDate(storedData)
    setWorkoutData(grouped)

    // Load custom workouts
    const stored = localStorage.getItem(CUSTOM_WORKOUTS_KEY)
    if (stored) {
      const customWorkouts: CustomWorkout[] = JSON.parse(stored)
      // For each custom workout, find the latest date it was performed
      const workoutsWithLastPerformed: CustomWorkoutWithLastPerformed[] = customWorkouts.map(workout => {
        const dates = Object.keys(grouped.workouts)
          .filter(date => 
            grouped.workouts[date].some(exercise => 
              exercise.exerciseName === workout.exercises[0].exerciseName
            )
          )
          .sort((a, b) => {
            const [dayA, monthA] = a.split('.').map(Number)
            const [dayB, monthB] = b.split('.').map(Number)
            return monthB - monthA || dayB - dayA
          })
        
        return {
          ...workout,
          lastPerformed: dates[0] || workout.date
        }
      })
      setCustomWorkouts(workoutsWithLastPerformed)
    }
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

  const handleDeleteDay = (date: string) => {
    const storedData = loadFromLocalStorage()

    // Remove all exercises for this date
    Object.keys(storedData).forEach(exerciseName => {
      storedData[exerciseName] = storedData[exerciseName].filter(
        workout => workout.date !== date
      )

      // Clean up empty exercise entries
      if (storedData[exerciseName].length === 0) {
        delete storedData[exerciseName]
      }
    })

    saveToLocalStorage(storedData)
    loadWorkouts()
    setDrawerOpen(false)
  }

  const calculateDayStats = (workouts: GroupedWorkouts[string]) => {
    return workouts.reduce((stats, workout) => {
      return {
        exerciseCount: stats.exerciseCount + 1,
        totalSets: stats.totalSets + workout.sets.length,
        totalWeight: stats.totalWeight + workout.volume,
      }
    }, { exerciseCount: 0, totalSets: 0, totalWeight: 0 })
  }

  const handleSaveCustomWorkout = () => {
    if (!customWorkoutName.trim()) return

    const customWorkout: CustomWorkout = {
      name: customWorkoutName,
      date: selectedDate,
      exercises: workoutData.workouts[selectedDate]
    }

    saveCustomWorkout(customWorkout)
    setCustomWorkoutName("")
    setSaveWorkoutDialogOpen(false)
    setDrawerOpen(false)
  }

  const handleRenameCustomWorkout = () => {
    if (!selectedCustomWorkout || !newCustomWorkoutName.trim()) return

    const stored = localStorage.getItem(CUSTOM_WORKOUTS_KEY)
    if (stored) {
      const customWorkouts: CustomWorkout[] = JSON.parse(stored)
      const updatedWorkouts = customWorkouts.map(workout => 
        workout.name === selectedCustomWorkout.name
          ? { ...workout, name: newCustomWorkoutName }
          : workout
      )
      localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(updatedWorkouts))
      loadWorkouts() // Reload the workouts to reflect changes
    }
    setNewCustomWorkoutName("")
    setCustomWorkoutDrawerOpen(false)
  }

  const handleDeleteCustomWorkout = () => {
    if (!selectedCustomWorkout) return

    const stored = localStorage.getItem(CUSTOM_WORKOUTS_KEY)
    if (stored) {
      const customWorkouts: CustomWorkout[] = JSON.parse(stored)
      const updatedWorkouts = customWorkouts.filter(
        workout => workout.name !== selectedCustomWorkout.name
      )
      localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(updatedWorkouts))
      loadWorkouts() // Reload the workouts to reflect changes
    }
    setCustomWorkoutDrawerOpen(false)
  }

  return (
    <div className="w-full space-y-6">
      {/* Custom Workouts Section */}
      {customWorkouts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Saved Workouts</h2>
          <div className="space-y-4">
            {customWorkouts.map((workout, index) => {
              const stats = calculateDayStats(workout.exercises.map(exercise => ({
                ...exercise,
                exerciseName: exercise.exerciseName
              })))

              return (
                <div key={index} className="border border-accent rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{workout.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last performed: {workout.lastPerformed}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCustomWorkout(workout)
                          setNewCustomWorkoutName(workout.name)
                          setCustomWorkoutDrawerOpen(true)
                        }}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-evenly gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{stats.exerciseCount}</span>
                        <span className="text-xs text-muted-foreground">Exercises</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{stats.totalSets}</span>
                        <span className="text-xs text-muted-foreground">Sets</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{stats.totalWeight}</span>
                        <span className="text-xs text-muted-foreground">kg Total</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regular History Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Workout History</h2>
        <Accordion type="single" collapsible className="w-full">
          {Object.keys(workoutData.workouts).sort((a, b) => {
            const [dayA, monthA] = a.split('.').map(Number)
            const [dayB, monthB] = b.split('.').map(Number)
            return monthB - monthA || dayB - dayA
          }).map((date) => {
            const dayStats = calculateDayStats(workoutData.workouts[date])
            const customWorkoutName = workoutData.customWorkoutsByDate[date]

            return (
              <AccordionItem key={date} value={date} className="border-b border-accent">
                <AccordionTrigger className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{date}</span>
                    {workoutData.workouts[date].length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="ml-2 overflow-hidden text-secondary-foreground">
                          {workoutData.workouts[date].reduce((max, workout) =>
                            workout.volume > max.volume ? workout : max
                          ).exerciseName} day
                        </span>
                        {customWorkoutName && (
                          <span className="text-xs px-2 break-all py-0.5 rounded-full bg-accent">
                            {customWorkoutName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center py-4 mb-2">
                    <div className="flex justify-evenly gap-8 w-full">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{dayStats.exerciseCount}</span>
                        <span className="text-xs text-muted-foreground">Exercises</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{dayStats.totalSets}</span>
                        <span className="text-xs text-muted-foreground">Sets</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{dayStats.totalWeight}</span>
                        <span className="text-xs text-muted-foreground">kg Total</span>
                      </div>
                    </div>

                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                      <DrawerTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-4 mr-1"
                          onClick={() => setSelectedDate(date)}
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent className="border border-accent pb-10">
                        <DrawerHeader>
                          <DrawerTitle>Workout Options</DrawerTitle>
                          <DrawerDescription>
                            Manage your workout from {selectedDate}
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-2">
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full flex items-center gap-2"
                            onClick={() => {
                              // Implement share functionality
                              setDrawerOpen(false)
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                            Share Workout
                          </Button>

                          <Dialog open={saveWorkoutDialogOpen} onOpenChange={setSaveWorkoutDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                className="w-full flex items-center gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Save as Custom Workout
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Save Custom Workout</DialogTitle>
                                <DialogDescription>
                                  Give your workout a name to save it as a custom template
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Input
                                  placeholder="Workout name"
                                  value={customWorkoutName}
                                  onChange={(e) => setCustomWorkoutName(e.target.value)}
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSaveWorkoutDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveCustomWorkout}>
                                  Save Workout
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="lg"
                            className="w-full flex items-center gap-2"
                            onClick={() => handleDeleteDay(selectedDate)}
                          >
                            <Trash className="h-4 w-4" />
                            Delete Day
                          </Button>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline" size="lg">
                              Cancel
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                  <div className="space-y-2">
                    {workoutData.workouts[date].map((workout, index) => (
                      <div key={index} className="bg-transparent p-0 relative">
                        <h3
                          className="mb-0 cursor-pointer bg-accent/60 hover:text-primary px-4 py-2 border border-b-0 border-accent rounded-t-lg flex items-center gap-2 underline"
                          onClick={() => onExerciseSelect(workout.exerciseName)}
                        >
                          {workout.exerciseName}
                          <SquareArrowOutUpRight className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.25} />
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
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
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
            )
          })}
        </Accordion>
      </div>

      <Drawer open={customWorkoutDrawerOpen} onOpenChange={setCustomWorkoutDrawerOpen}>
        <DrawerContent className="border border-accent pb-10">
          <DrawerHeader>
            <DrawerTitle>Custom Workout Options</DrawerTitle>
            <DrawerDescription>
              Manage your custom workout: {selectedCustomWorkout?.name}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="workoutName" className="text-sm font-medium">
                Workout Name
              </label>
              <Input
                id="workoutName"
                value={newCustomWorkoutName}
                onChange={(e) => setNewCustomWorkoutName(e.target.value)}
                placeholder="Enter new name"
              />
              <Button 
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleRenameCustomWorkout}
              >
                Rename Workout
              </Button>
            </div>

            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleDeleteCustomWorkout}
            >
              Delete Custom Workout
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
} 