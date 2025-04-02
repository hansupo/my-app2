"use client"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History } from "@/components/history"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { DrawerDemo } from "@/components/ui/drawer-demo"
import { Bar, BarChart, ResponsiveContainer } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Component } from "@/components/ui/component"
import { CalendarDemo } from "@/components/ui/calendar-demo"


interface WorkoutSet {
  date: string;
  sets: string[];
  isLatest: boolean;
}

interface StoredWorkout {
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

interface EditingSet {
  date: string;
  setIndex: number;
  value: string;
  notes?: string;
}

interface StoredWorkouts {
  [exerciseName: string]: StoredWorkout[];
}

const STORAGE_KEY = 'workoutData'

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
  localStorage.setItem('customExercises', JSON.stringify(exercises))
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

const exportWorkoutData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    alert('No workout data to export');
    return;
  }

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workout-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const importWorkoutData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsedData = JSON.parse(content);
      
      // Basic validation of the data structure
      if (typeof parsedData === 'object' && parsedData !== null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
        // Refresh the page to load new data
        window.location.reload();
      } else {
        alert('Invalid data format');
      }
    } catch (error) {
      alert('Error reading file');
      console.error(error);
    }
  };
  reader.readAsText(file);
};

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
  const [editingSet, setEditingSet] = useState<EditingSet | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [exercises, setExercises] = useState(
    exercisesData.map(name => ({
      value: name,
      label: name
    }))
  )
  const [customExercises, setCustomExercises] = useState<string[]>([])
  const [lastWorkoutDates, setLastWorkoutDates] = useState<{ [key: string]: string }>({})
  const [activeTab, setActiveTab] = useState("workout")

  useEffect(() => {
    if (selectedExercise) {
      const storedData = loadFromLocalStorage()
      const exerciseData = storedData[selectedExercise] || []

      const convertedData: WorkoutSet[] = exerciseData.map(workout => ({
        date: workout.date,
        sets: workout.sets.map(set => {
          // Handle both old (string) and new (object) formats
          if (typeof set === 'string') {
            return set
          }
          return set.value
        }),
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
    // Get custom exercises that are not in the predefined list
    const customExerciseNames = Object.keys(storedData).filter(
      name => !exercisesData.includes(name)
    )
    setCustomExercises(customExerciseNames)

    // Create two arrays: one for localStorage exercises and one for predefined exercises
    const localStorageExercises = Object.keys(storedData).map(name => ({
      value: name,
      label: name,
      isCustom: true
    }))

    const predefinedExercises = exercisesData
      .filter(name => !Object.keys(storedData).includes(name))
      .map(name => ({
        value: name,
        label: name,
        isCustom: false
      }))

    // Combine the arrays with localStorage exercises first
    setExercises([...localStorageExercises, ...predefinedExercises])
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
    const storedData = loadFromLocalStorage()
    const exerciseData = storedData[selectedExercise] || []
    const workout = exerciseData.find(w => w.date === date)
    const set = workout?.sets[setIndex]

    // Handle both old and new formats when getting notes
    const notes = typeof set === 'string' ? "" : (set?.notes || "")

    setEditingSet({ date, setIndex, value, notes })
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
          exerciseData[storageIndex].sets[editingSet.setIndex] = {
            value: setString,
            notes: editingSet.notes
          }
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
        exerciseData[storageIndex].sets.push({
          value: setString,
          notes: editingSet?.notes || ""
        })
      } else {
        exerciseData.push({
          exerciseName: selectedExercise,
          date: formattedDate,
          sets: [{
            value: setString,
            notes: editingSet?.notes || ""
          }],
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
        sets: [{
          value: setString,
          notes: editingSet?.notes || ""
        }],
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
      <TableHead key="date" className="uppercase text-muted-foreground">Date</TableHead>
    ]

    for (let i = 0; i < maxSets; i++) {
      headers.push(
        <TableHead key={`set${i + 1}`}>#{i + 1} </TableHead>
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

  const handleExerciseSelect = (exerciseName: string) => {
    setSelectedExercise(exerciseName)
    setActiveTab("workout")
  }

  return (
    <main className="flex flex-col items-center justify-between pt-0 relative w-full h-full overflow-hidden">

      <div className="flex flex-col items-center gap-4 w-full p-4 max-w-3xl mx-auto h-full overflow-scroll mb-25">


        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
          <TabsContent value="home" className="mt-6 overflow-visible">
            <div className="w-full mb-12 flex flex-row justify-between gap-2 align-middle ">
              <h1 className="text-3xl font-bold">XYM<span className="font-light italic">WORKOUT</span></h1>
              <ModeToggle></ModeToggle>
            </div>

            <div className="flex flex-col gap-4">
              <Component></Component>

              
              
              <div className="border border-accent shadow rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Data Management</h2>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <Button 
                      onClick={exportWorkoutData}
                      className="w-full"
                    >
                      Export Workout Data
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importWorkoutData}
                      className="hidden"
                      id="import-file"
                    />
                    <Button 
                      onClick={() => document.getElementById('import-file')?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      Import Workout Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Select a previously exported workout data file to import
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <CalendarDemo></CalendarDemo>
              </div>
            </div>
            <br />
          </TabsContent>

          <TabsContent value="workout" className="mt-6 flex flex-col h-full overflow-auto">
            <div className="flex-1 overflow-auto">
              <ComboboxDemo
                value={selectedExercise}
                onValueChange={setSelectedExercise}
                options={exercises}
                placeholder="Search exercises"
                onAddCustomExercise={handleAddCustomExercise}
                lastWorkoutDates={lastWorkoutDates}
              />

              <Table className="mt-6">
                <TableCaption></TableCaption>
                <TableHeader>
                  <TableRow>
                    {generateHeaders()}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workoutData.map((workout, index) => (
                    <TableRow key={index}>
                      <TableCell className={`font-medium ${workout.isLatest ? 'font-bold italic' : ''} `}>
                        {workout.date}
                      </TableCell>
                      {Array.from({ length: maxSets }).map((_, setIndex) => (
                        <TableCell
                          key={setIndex}
                          className={`${workout.isLatest ? 'font-bold italic' : ''} cursor-pointer hover:bg-gray-50`}
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

            <div className="w-full px-4 py-4">
              <DrawerDemo
                isEditing={isEditing}
                editingSet={editingSet}
                onLogSet={handleLogSet}
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(date || new Date())}
                notes={editingSet?.notes || ""}
                onNotesChange={(notes) => {
                  if (editingSet) {
                    setEditingSet({ ...editingSet, notes })
                  }
                }}
                reps={reps}
                repsInput={repsInput}
                weight={weight}
                weightInput={weightInput}
                weightStep={weightStep}
                onRepsChange={(value) => {
                  setRepsInput(value)
                  const numValue = value === "" ? 0 : Number(value)
                  setReps(numValue)
                }}
                onWeightChange={(value) => {
                  setWeightInput(value)
                  const numValue = value === "" ? 0 : Number(value)
                  setWeight(numValue)
                }}
                onWeightStepChange={(value) => setWeightStep(value)}
                onIncreaseReps={increaseReps}
                onDecreaseReps={decreaseReps}
                onIncreaseWeight={increaseWeight}
                onDecreaseWeight={decreaseWeight}
                open={drawerOpen}
                onOpenChange={(open) => {
                  setDrawerOpen(open)
                  if (!open) {
                    setIsEditing(false)
                    setEditingSet(null)
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6 overflow-visible">
            <History onExerciseSelect={handleExerciseSelect} />
          </TabsContent>

          <div className="fixed bottom-0 left-0 right-0 border-t border-accent bg-background pb-safe">
            <TabsList className="grid w-full grid-cols-4 h-16">
              <TabsTrigger value="home" className="flex flex-col gap-1">
              <svg className="fill-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="#BBBBBB" strokeWidth="0.00024000000000000003"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.8321 9.5547C18.1384 9.09517 18.0142 8.4743 17.5547 8.16795C17.0952 7.8616 16.4743 7.98577 16.168 8.4453L13.3925 12.6085L10.0529 10.3542C9.421 9.92768 8.55941 10.1339 8.18917 10.8004L6.12584 14.5144C5.85763 14.9971 6.03157 15.6059 6.51436 15.8742C6.99714 16.1424 7.60594 15.9684 7.87416 15.4856L9.56672 12.439L12.8571 14.66C13.4546 15.0634 14.2662 14.9035 14.6661 14.3036L17.8321 9.5547Z" ></path> <path fillRule="evenodd" clipRule="evenodd" d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM4 7C4 5.34315 5.34315 4 7 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7Z" ></path> </g></svg>
                <span>Home</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex flex-col gap-1">
              <svg className="fill-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 5C5.34315 5 4 6.34315 4 8V16C4 17.6569 5.34315 19 7 19H17C18.6569 19 20 17.6569 20 16V12.5C20 11.9477 20.4477 11.5 21 11.5C21.5523 11.5 22 11.9477 22 12.5V16C22 18.7614 19.7614 21 17 21H7C4.23858 21 2 18.7614 2 16V8C2 5.23858 4.23858 3 7 3H10.5C11.0523 3 11.5 3.44772 11.5 4C11.5 4.55228 11.0523 5 10.5 5H7Z" ></path> <path fillRule="evenodd" clipRule="evenodd" d="M18.8431 3.58579C18.0621 2.80474 16.7957 2.80474 16.0147 3.58579L11.6806 7.91992L11.0148 11.9455C10.8917 12.6897 11.537 13.3342 12.281 13.21L16.3011 12.5394L20.6347 8.20582C21.4158 7.42477 21.4158 6.15844 20.6347 5.37739L18.8431 3.58579ZM13.1933 11.0302L13.5489 8.87995L17.4289 5L19.2205 6.7916L15.34 10.6721L13.1933 11.0302Z" ></path> </g></svg>
                <span>Workout</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col gap-1">
              <svg className=" fill-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M5.01112 11.5747L6.29288 10.2929C6.68341 9.90236 7.31657 9.90236 7.7071 10.2929C8.09762 10.6834 8.09762 11.3166 7.7071 11.7071L4.7071 14.7071C4.51956 14.8946 4.26521 15 3.99999 15C3.73477 15 3.48042 14.8946 3.29288 14.7071L0.292884 11.7071C-0.0976406 11.3166 -0.0976406 10.6834 0.292884 10.2929C0.683408 9.90236 1.31657 9.90236 1.7071 10.2929L3.0081 11.5939C3.22117 6.25933 7.61317 2 13 2C18.5229 2 23 6.47715 23 12C23 17.5228 18.5229 22 13 22C9.85817 22 7.05429 20.5499 5.22263 18.2864C4.87522 17.8571 4.94163 17.2274 5.37096 16.88C5.80028 16.5326 6.42996 16.599 6.77737 17.0283C8.24562 18.8427 10.4873 20 13 20C17.4183 20 21 16.4183 21 12C21 7.58172 17.4183 4 13 4C8.72441 4 5.23221 7.35412 5.01112 11.5747ZM13 5C13.5523 5 14 5.44772 14 6V11.5858L16.7071 14.2929C17.0976 14.6834 17.0976 15.3166 16.7071 15.7071C16.3166 16.0976 15.6834 16.0976 15.2929 15.7071L12.2929 12.7071C12.1054 12.5196 12 12.2652 12 12V6C12 5.44772 12.4477 5 13 5Z" ></path> </g></svg>
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="coach" className="flex flex-col gap-1">
              <svg className="stroke-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Communication / Chat_Circle_Check"> <path id="Vector" d="M15 10L11 14L9 12M12.0001 21C10.365 21 8.83174 20.5639 7.51025 19.8018C7.3797 19.7265 7.31434 19.6888 7.25293 19.6719C7.19578 19.6561 7.14475 19.6507 7.08559 19.6548C7.02253 19.6591 6.9573 19.6808 6.82759 19.7241L4.51807 20.4939L4.51625 20.4947C4.02892 20.6572 3.7848 20.7386 3.62256 20.6807C3.4812 20.6303 3.36979 20.5187 3.31938 20.3774C3.26157 20.2152 3.34268 19.9719 3.50489 19.4853L3.50586 19.4823L4.27468 17.1758L4.27651 17.171C4.31936 17.0424 4.34106 16.9773 4.34535 16.9146C4.3494 16.8554 4.34401 16.804 4.32821 16.7469C4.31146 16.6863 4.27448 16.6221 4.20114 16.495L4.19819 16.4899C3.43604 15.1684 3 13.6351 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9707 21 12.0001 21Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g> </g></svg>
              <span>Coach</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </main>
  )
}