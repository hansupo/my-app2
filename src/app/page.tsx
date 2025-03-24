"use client"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerDemo } from "@/components/ui/date-picker-demo"
import { ComboboxDemo } from "@/components/ui/combobox-demo"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import exercisesData from '@/public/data/exercises.json'

interface WorkoutSet {
  date: string;
  sets: string[];
  isLatest: boolean;
}

interface StoredWorkout {
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
  [exerciseName: string]: StoredWorkout[];
}

const STORAGE_KEY = 'workoutData'
const CUSTOM_EXERCISES_KEY = 'customExercises'

const saveToLocalStorage = (data: StoredWorkouts) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

const loadFromLocalStorage = (): StoredWorkouts => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }
  return {}
}

const saveCustomExercises = (exercises: string[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises))
  }
}

const loadCustomExercises = (): string[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY)
    return stored ? JSON.parse(stored) : []
  }
  return []
}

const getLastWorkoutDates = (storedData: StoredWorkouts): { [key: string]: string } => {
  const lastDates: { [key: string]: string } = {}
  
  Object.entries(storedData).forEach(([exercise, workouts]) => {
    if (workouts.length > 0) {
      // Sort workouts by date in descending order and get the most recent one
      const sortedWorkouts = [...workouts].sort((a, b) => {
        const [dayA, monthA] = a.date.split('.').map(Number)
        const [dayB, monthB] = b.date.split('.').map(Number)
        return monthB - monthA || dayB - dayA
      })
      lastDates[exercise] = sortedWorkouts[0].date
    }
  })
  
  return lastDates
}

export default function Home() {
  const [reps, setReps] = useState(8)
  const [repsInput, setRepsInput] = useState("8")
  const [weight, setWeight] = useState(50)
  const [weightInput, setWeightInput] = useState("50")
  const [weightStep, setWeightStep] = useState("5")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workoutData, setWorkoutData] = useState<WorkoutSet[]>([])
  const [maxSets, setMaxSets] = useState(0)
  const [selectedExercise, setSelectedExercise] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingSet, setEditingSet] = useState<{
    date: string;
    setIndex: number;
    value: string;
  } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [exercises, setExercises] = useState(
    exercisesData.map(name => ({
      value: name,
      label: name
    }))
  )
  const [doneExercises, setDoneExercises] = useState<string[]>([])
  const [customExercises, setCustomExercises] = useState<string[]>([])
  const [lastWorkoutDates, setLastWorkoutDates] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (selectedExercise) {
      const storedData = loadFromLocalStorage()
      const exerciseData = storedData[selectedExercise] || []
      
      const convertedData: WorkoutSet[] = exerciseData.map(workout => ({
        date: workout.date,
        sets: workout.sets,
        isLatest: false
      }))

      if (convertedData.length > 0) {
        convertedData[convertedData.length - 1].isLatest = true
      }

      setWorkoutData(convertedData)
      setMaxSets(Math.max(...convertedData.map(w => w.sets.length), 0))

      if (exerciseData.length > 0) {
        const firstWorkout = exerciseData[0]
        setReps(firstWorkout.defaultValues.reps)
        setRepsInput(String(firstWorkout.defaultValues.reps))
        setWeight(firstWorkout.defaultValues.weight)
        setWeightInput(String(firstWorkout.defaultValues.weight))
        setWeightStep(firstWorkout.defaultValues.weightStep)
      }
    }
  }, [selectedExercise])

  useEffect(() => {
    const storedData = loadFromLocalStorage()
    setDoneExercises(Object.keys(storedData))
  }, [])

  useEffect(() => {
    const loadedCustomExercises = loadCustomExercises()
    setCustomExercises(loadedCustomExercises)
    setExercises(prev => {
      const customExerciseOptions = loadedCustomExercises.map(name => ({
        value: name,
        label: name
      }))
      return [...prev, ...customExerciseOptions]
    })
  }, [])

  useEffect(() => {
    const storedData = loadFromLocalStorage()
    setLastWorkoutDates(getLastWorkoutDates(storedData))
  }, [])

  const increaseReps = () => {
    const newValue = reps + 1
    setReps(newValue)
    setRepsInput(String(newValue))
  }

  const decreaseReps = () => {
    const newValue = Math.max(0, reps - 1)
    setReps(newValue)
    setRepsInput(String(newValue))
  }

  const increaseWeight = () => {
    const newValue = weight + Number(weightStep)
    setWeight(newValue)
    setWeightInput(String(newValue))
  }

  const decreaseWeight = () => {
    const newValue = Math.max(0, weight - Number(weightStep))
    setWeight(newValue)
    setWeightInput(String(newValue))
  }

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRepsInput(value)
    const numValue = value === "" ? 0 : Number(value)
    setReps(numValue)
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWeightInput(value)
    const numValue = value === "" ? 0 : Number(value)
    setWeight(numValue)
  }

  const handleCellClick = (date: string, setIndex: number, value: string) => {
    setIsEditing(true)
    setEditingSet({ date, setIndex, value })
    const [repsStr, weightStr] = value.split('x')
    setReps(Number(repsStr))
    setRepsInput(repsStr)
    setWeight(Number(weightStr))
    setWeightInput(weightStr)
    setDrawerOpen(true)
  }

  const handleLogSet = () => {
    const formattedDate = format(selectedDate, "dd.MM")
    const setString = `${reps}x${weight}`

    const existingDateIndex = workoutData.findIndex(
      (workout) => workout.date === formattedDate
    )

    const storedData = loadFromLocalStorage()
    const exerciseData = storedData[selectedExercise] || []
    
    if (isEditing && editingSet) {
      const updatedData = [...workoutData]
      const dateIndex = updatedData.findIndex(w => w.date === editingSet.date)
      if (dateIndex !== -1) {
        updatedData[dateIndex].sets[editingSet.setIndex] = setString
        setWorkoutData(updatedData)
        
        const storageIndex = exerciseData.findIndex(w => w.date === editingSet.date)
        if (storageIndex !== -1) {
          exerciseData[storageIndex].sets[editingSet.setIndex] = setString
          storedData[selectedExercise] = exerciseData
          saveToLocalStorage(storedData)
        }
      }
      setIsEditing(false)
      setEditingSet(null)
      return
    }

    if (existingDateIndex !== -1) {
      const updatedData = [...workoutData]
      updatedData[existingDateIndex].sets.push(setString)
      setMaxSets(Math.max(maxSets, updatedData[existingDateIndex].sets.length))
      updatedData.forEach(workout => workout.isLatest = false)
      updatedData[existingDateIndex].isLatest = true
      setWorkoutData(updatedData)

      const storageIndex = exerciseData.findIndex(w => w.date === formattedDate)
      if (storageIndex !== -1) {
        exerciseData[storageIndex].sets.push(setString)
      } else {
        exerciseData.push({
          exerciseName: selectedExercise,
          date: formattedDate,
          sets: [setString],
          defaultValues: {
            reps,
            weight,
            weightStep
          }
        })
      }
      storedData[selectedExercise] = exerciseData
      saveToLocalStorage(storedData)
    } else {
      const newData = [...workoutData]
      newData.forEach(workout => workout.isLatest = false)
      const newEntry: WorkoutSet = {
        date: formattedDate,
        sets: [setString],
        isLatest: true
      }
      setMaxSets(Math.max(maxSets, 1))
      newData.push(newEntry)
      setWorkoutData(newData)

      exerciseData.push({
        exerciseName: selectedExercise,
        date: formattedDate,
        sets: [setString],
        defaultValues: {
          reps,
          weight,
          weightStep
        }
      })
      storedData[selectedExercise] = exerciseData
      saveToLocalStorage(storedData)
    }
  }

  const generateHeaders = () => {
    const headers = [
      <TableHead key="date">Date</TableHead>
    ]

    for (let i = 0; i < maxSets; i++) {
      headers.push(
        <TableHead key={`set${i + 1}`}>#{i + 1}</TableHead>
      )
    }

    return headers
  }

  const handleAddCustomExercise = (exercise: string) => {
    const newCustomExercises = [...customExercises, exercise]
    setCustomExercises(newCustomExercises)
    saveCustomExercises(newCustomExercises)
    
    setExercises(prev => [...prev, { value: exercise, label: exercise }])
    setSelectedExercise(exercise)
  }

  return (
    <main className="flex flex-col items-center justify-between p-2 pt-10 relative">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl my-10 font-bold">Gym Workout</h1>

        <ComboboxDemo
          value={selectedExercise}
          onValueChange={setSelectedExercise}
          options={exercises}
          placeholder="Select exercise..."
          onAddCustomExercise={handleAddCustomExercise}
          lastWorkoutDates={lastWorkoutDates}
        />


        <Table>
          <TableCaption></TableCaption>
          <TableHeader>
            <TableRow>
              {generateHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {workoutData.map((workout, index) => (
              <TableRow key={index}>
                <TableCell className={`font-medium ${workout.isLatest ? 'font-bold bg-gray-100' : ''}`}>
                  {workout.date}
                </TableCell>
                {Array.from({ length: maxSets }).map((_, setIndex) => (
                  <TableCell
                    key={setIndex}
                    className={`${workout.isLatest ? 'font-bold bg-gray-100' : ''} cursor-pointer hover:bg-gray-50`}
                    onClick={() => handleCellClick(workout.date, setIndex, workout.sets[setIndex] || '')}
                  >
                    {workout.sets[setIndex] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="fixed bottom-4 right-4">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="default" size="lg" className="rounded-full shadow-lg">
              Log new set
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="">
              <DrawerTitle className="w-full text-center">
                {isEditing ? 'Edit Set' : 'Log New Set'}


              </DrawerTitle>
              <DrawerDescription className="w-full text-center">

              </DrawerDescription>

            </DrawerHeader>

            <div className="px-4">
              <div className="flex gap-2 justify-between">
              <Label className="w-1/2" htmlFor="email">Date</Label>
              <DatePickerDemo
                    date={selectedDate}
                    onDateChange={(date) => setSelectedDate(date || new Date())}
                  />
              </div>
              <br />
              <div className="flex gap-2 justify-between">
                <Label className="w-1/2" htmlFor="email">Reps done</Label>
                <Button
                  className=""
                  variant="secondary"
                  size="icon"
                  onClick={decreaseReps}
                >
                  -
                </Button>
                <Input
                  className="w-1/4 content-center text-center"
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={repsInput}
                  onChange={handleRepsChange}
                  placeholder="15 reps"
                />
                <Button
                  className=""
                  variant="secondary"
                  size="icon"
                  onClick={increaseReps}
                >
                  +
                </Button>
              </div>
              <br />
              <div className="flex gap-2 justify-between">
                <Label className="w-1/2" htmlFor="email">Weight lifted</Label>
                <Button onClick={decreaseWeight} className="" variant="secondary" size="icon">-</Button>
                <Input
                  value={weightInput}
                  onChange={handleWeightChange}
                  className="w-1/4 content-center text-center"
                  type="number"
                  pattern="[0-9]*[.]?[0-9]*"
                  inputMode="decimal"
                  placeholder="50kg"
                />
                <Button onClick={increaseWeight} className="" variant="secondary" size="icon">+</Button>
              </div>
              <br />
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Steps in weight ({weightStep})</AccordionTrigger>
                  <AccordionContent>
                    <ToggleGroup
                      variant="outline"
                      size={"sm"}
                      type="single"
                      className="flex w-full"
                      value={weightStep}
                      onValueChange={(value) => {
                        if (value) setWeightStep(value)
                      }}
                    >
                      <ToggleGroupItem value="1">1</ToggleGroupItem>
                      <ToggleGroupItem value="2.5">2.5</ToggleGroupItem>
                      <ToggleGroupItem value="5">5</ToggleGroupItem>
                      <ToggleGroupItem value="10">10</ToggleGroupItem>
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <DrawerFooter className="flex w-full flex-row pr-6">
              <DrawerClose asChild className="p-0">
                <Button className="w-1/2" variant="outline">Cancel</Button>
              </DrawerClose>
              <DrawerClose asChild className="p-0">
                <Button className="w-1/2" onClick={handleLogSet}>
                  {isEditing ? 'Edit' : 'Log'}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </main>
  )
}