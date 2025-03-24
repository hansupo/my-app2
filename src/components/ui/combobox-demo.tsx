"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, History } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ComboboxDemoProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  onAddCustomExercise?: (exercise: string) => void;
  lastWorkoutDates?: { [key: string]: string };
}

export function ComboboxDemo({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "Select option...",
  onAddCustomExercise,
  lastWorkoutDates = {}
}: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newExercise, setNewExercise] = React.useState("")

  const handleAddExercise = () => {
    if (newExercise.trim()) {
      onAddCustomExercise?.(newExercise.trim())
      setNewExercise("")
      setDialogOpen(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value && options.length > 0
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 m-4">
          <CommandPrimitive>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="add-custom"
                  onSelect={() => {
                    setOpen(false)
                    setDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add custom exercise
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue: string) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </div>
                      {lastWorkoutDates[option.value] && (
                        <Badge variant="secondary" className="ml-2">
                          <History className="h-3 w-3 mr-1" />
                          {lastWorkoutDates[option.value]}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandPrimitive>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Exercise</DialogTitle>
            <DialogDescription>
              Enter the name of your custom exercise.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise">Exercise Name</Label>
              <Input
                id="exercise"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                placeholder="Enter exercise name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddExercise()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExercise}>
              Add Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 