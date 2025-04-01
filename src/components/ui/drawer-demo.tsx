"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerDemo } from "@/components/ui/date-picker-demo"
import { NotesDialog } from "@/components/ui/notes-dialog"
import { format } from "date-fns"

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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DrawerDemoProps {
    isEditing?: boolean;
    editingSet?: {
        date: string;
        setIndex: number;
        value: string;
        notes?: string;
    } | null;
    onLogSet?: () => void;
    selectedDate?: Date;
    onDateChange?: (date: Date | undefined) => void;
    notes?: string;
    onNotesChange?: (notes: string) => void;
    reps: number;
    repsInput: string;
    weight: number;
    weightInput: string;
    weightStep: string;
    onRepsChange: (value: string) => void;
    onWeightChange: (value: string) => void;
    onWeightStepChange: (value: string) => void;
    onIncreaseReps: () => void;
    onDecreaseReps: () => void;
    onIncreaseWeight: () => void;
    onDecreaseWeight: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DrawerDemo({
    isEditing = false,
    editingSet = null,
    onLogSet,
    selectedDate = new Date(),
    onDateChange,
    notes = "",
    onNotesChange,
    reps,
    repsInput,
    weight,
    weightInput,
    weightStep,
    onRepsChange,
    onWeightChange,
    onWeightStepChange,
    onIncreaseReps,
    onDecreaseReps,
    onIncreaseWeight,
    onDecreaseWeight,
    open,
    onOpenChange
}: DrawerDemoProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button
                className="w-full"
                size="lg"
                >Log a set</Button>
            </DrawerTrigger>
            <DrawerHeader hidden>
                <DrawerTitle></DrawerTitle>
            </DrawerHeader>
            <DrawerContent className="border border-accent">
                <div className="mx-auto w-full max-w-sm pb-10">
                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-2 mb-4 px-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-8 shrink-0 rounded-lg"
                                onClick={onDecreaseReps}
                                disabled={reps <= 0}
                            >
                                <Minus className="h-4 w-4" />
                                <span className="sr-only">Decrease reps</span>
                            </Button>
                            <div className="flex-initial text-center">
                                <Input
                                    className="text-center italic text-6xl font-extrabold h-18 border-0 shadow-none"
                                    type="number"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    value={repsInput}
                                    onChange={(e) => onRepsChange(e.target.value)}
                                    placeholder="0"
                                />
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                    reps
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-8 shrink-0 rounded-lg"
                                onClick={onIncreaseReps}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Increase reps</span>
                            </Button>
                        </div>

                        <div className="flex items-center justify-center space-x-2 mb-4 px-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-8 shrink-0 rounded-lg"
                                onClick={onDecreaseWeight}
                                disabled={weight <= 0}
                            >
                                <Minus className="h-4 w-4" />
                                <span className="sr-only">Decrease weight</span>
                            </Button>
                            <div className="flex-initial text-center">
                                <Input
                                    className="text-center italic text-6xl font-extrabold h-18 border-0 shadow-none"
                                    type="number"
                                    pattern="[0-9]*[.]?[0-9]*"
                                    inputMode="decimal"
                                    value={weightInput}
                                    onChange={(e) => onWeightChange(e.target.value)}
                                    placeholder="0"
                                />
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                    weight in kg
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-8 shrink-0 rounded-lg"
                                onClick={onIncreaseWeight}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Increase weight</span>
                            </Button>
                        </div>

                        <div className="flex gap-4 mb-2 mt-8">
                            <ToggleGroup
                                variant="outline"
                                size="sm"
                                type="single"
                                className="flex w-full mr-12+ text-muted-foreground"
                                value={weightStep}
                                onValueChange={(value) => {
                                    if (value) onWeightStepChange(value)
                                }}
                            >
                                <ToggleGroupItem value="1">1</ToggleGroupItem>
                                <ToggleGroupItem value="2.5">2.5</ToggleGroupItem>
                                <ToggleGroupItem value="5">5</ToggleGroupItem>
                                <ToggleGroupItem value="10">10</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                    <DrawerFooter className="flex">
                        <DrawerClose className="mb-2" asChild>
                            <Button size="lg" onClick={onLogSet} variant={isEditing ? "destructive" : "default"}>
                                {isEditing ? 'Edit' : 'Log'}
                            </Button>
                        </DrawerClose>
                        <div className="flex justify-between gap-1 pr-4">
                            <DatePickerDemo
                                date={selectedDate}
                                onDateChange={onDateChange}
                            />
                            <NotesDialog
                                notes={notes}
                                onNotesChange={onNotesChange}
                            />
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
