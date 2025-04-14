"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
}

interface CustomWorkoutsProps {
    onExerciseSelect: (exerciseName: string) => void;
    onTargetValuesChange: (reps: number, weight: number) => void;
}

interface ExerciseInfo {
    name: string;
    targetReps: number;
    targetWeight: number;
    totalSets: number;
}

export function CustomWorkouts({ 
    onExerciseSelect, 
    onTargetValuesChange 
}: CustomWorkoutsProps) {
    const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([])
    const [selectedWorkout, setSelectedWorkout] = useState<CustomWorkout | null>(null)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)

    // Load custom workouts only once on mount
    useEffect(() => {
        const stored = localStorage.getItem('customWorkouts')
        if (stored) {
            setCustomWorkouts(JSON.parse(stored))
        }
    }, [])

    // Memoize the update function to prevent it from changing on every render
    const updateTargetValues = useCallback((workout: CustomWorkout, index: number) => {
        const exercise = workout.exercises[index]
        const [targetReps, targetWeight] = exercise.sets[0].value.split('x').map(Number)
        onTargetValuesChange(targetReps, targetWeight)
    }, [onTargetValuesChange])

    // Update target values when workout or exercise changes
    useEffect(() => {
        if (selectedWorkout) {
            updateTargetValues(selectedWorkout, currentExerciseIndex)
        }
    }, [selectedWorkout, currentExerciseIndex, updateTargetValues])

    const handleWorkoutClick = (workout: CustomWorkout) => {
        setSelectedWorkout(workout)
        setCurrentExerciseIndex(0)
        onExerciseSelect(workout.exercises[0].exerciseName)
    }

    const getCurrentExerciseInfo = (): ExerciseInfo | null => {
        if (!selectedWorkout) return null

        const exercise = selectedWorkout.exercises[currentExerciseIndex]
        const [targetReps, targetWeight] = exercise.sets[0].value.split('x').map(Number)
        
        return {
            name: exercise.exerciseName,
            targetReps,
            targetWeight,
            totalSets: exercise.sets.length
        }
    }

    const handleNextClick = () => {
        if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1
            setCurrentExerciseIndex(nextIndex)
            onExerciseSelect(selectedWorkout.exercises[nextIndex].exerciseName)
        }
    }

    const handlePrevClick = () => {
        if (selectedWorkout && currentExerciseIndex > 0) {
            const prevIndex = currentExerciseIndex - 1
            setCurrentExerciseIndex(prevIndex)
            onExerciseSelect(selectedWorkout.exercises[prevIndex].exerciseName)
        }
    }

    if (selectedWorkout && getCurrentExerciseInfo()) {
        const exerciseInfo = getCurrentExerciseInfo()!
        return (
            <div className="w-full space-y-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedWorkout(null)
                        setCurrentExerciseIndex(0)
                    }}
                    className="px-0"
                >
                    ← Back to workouts
                </Button>

                <Card className="relative">
                    <CardHeader className="">
                        {/* <div className="flex items-center gap-2 justify-center">
                            <span className="text-sm text-muted-foreground">Workout</span>
                            <span className="font-2xl">{selectedWorkout.name}</span>
                        </div> */}
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-sm text-muted-foreground">Current</span>
                            <span className="font-2xl font-extrabold">{exerciseInfo.name}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2">
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`${currentExerciseIndex === 0 ? 'invisible' : ''}`}
                                onClick={handlePrevClick}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>

                            <div className="grid grid-cols-3 gap-2 flex-1">
                                <div className="space-y-1 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-extrabold italic">
                                        {exerciseInfo.totalSets}
                                    </p>
                                    <span className="text-xs text-muted-foreground uppercase">Sets</span>
                                </div>
                                <div className="space-y-1 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-extrabold italic">
                                        {exerciseInfo.targetReps}
                                    </p>
                                    <span className="text-xs text-muted-foreground uppercase">Reps</span>
                                </div>
                                <div className="space-y-1 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-extrabold italic">{exerciseInfo.targetWeight}</p>
                                    <span className="text-xs text-muted-foreground uppercase">Weight</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className={`${currentExerciseIndex === selectedWorkout.exercises.length - 1 ? 'invisible' : ''}`}
                                onClick={handleNextClick}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground pt-5">
                            Exercise {currentExerciseIndex + 1} of {selectedWorkout.exercises.length}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full mb-6">
            <h2 className="text-lg font-semibold mb-4">Custom Workouts</h2>
            <div className="grid grid-cols-2 gap-4 uppercase italic">
                {customWorkouts.map((workout, index) => (
                    <Card
                        key={index}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleWorkoutClick(workout)}
                    >
                        <CardHeader>
                            <CardTitle className="text-base">{workout.name}</CardTitle>
                            <CardDescription className="text-xs lowercase not-italic">
                                {workout.exercises.length} exercises
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
} 