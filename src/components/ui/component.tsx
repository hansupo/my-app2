"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useEffect, useState } from "react"

interface WorkoutData {
  date: string;
  totalWeight: number;
}

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

interface WorkoutDataStorage {
  [exerciseName: string]: ExerciseWorkout[];
}

const chartConfig = {
  totalWeight: {
    label: "Total Weight (kg)",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function Component() {
  const [chartData, setChartData] = useState<WorkoutData[]>([])

  useEffect(() => {
    // Load and process data from localStorage
    const workoutData = localStorage.getItem('workoutData')
    if (!workoutData) return

    const data = JSON.parse(workoutData) as WorkoutDataStorage
    const weightByDate: { [key: string]: number } = {}

    // Process all exercises
    Object.values(data).forEach((exercises) => {
      exercises.forEach((workout) => {
        const date = workout.date
        
        // Calculate total weight for this workout
        const workoutWeight = workout.sets.reduce((total: number, set) => {
          const value = typeof set === 'string' ? set : set.value
          const [reps, weight] = value.split('x').map(Number)
          return total + (reps * weight)
        }, 0)

        // Add to the date's total
        weightByDate[date] = (weightByDate[date] || 0) + workoutWeight
      })
    })

    // Convert to array and sort by date
    const sortedData = Object.entries(weightByDate)
      .map(([date, totalWeight]) => ({
        date,
        totalWeight
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('.').map(Number)
        const [dayB, monthB] = b.date.split('.').map(Number)
        return (monthA - monthB) || (dayA - dayB)
      })
      .slice(-6) // Get last 6 workouts

    setChartData(sortedData)
  }, [])

  return (
    <div className="w-full border border-accent rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Weight Lifted</h2>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />

          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Date
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.date}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Total Weight
                      </span>
                      <span className="font-bold">
                        {payload[0].value}kg
                      </span>
                    </div>
                  </div>
                </div>
              )
            }}
          />
          <Bar
            dataKey="totalWeight"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
