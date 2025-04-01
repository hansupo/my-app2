"use client"

import * as React from "react"
import { StickyNote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface NotesDialogProps {
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

export function NotesDialog({ notes = "", onNotesChange }: NotesDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [notesValue, setNotesValue] = React.useState(notes)

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNotesValue(value)
    onNotesChange?.(value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader hidden>
        <DialogTitle></DialogTitle>
      </DialogHeader>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-1/2"
        >
          <StickyNote className="h-4 w-4 mr-2" />
          Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Add notes about this set..."
            className="min-h-[200px] resize-none"
            value={notesValue}
            onChange={handleNotesChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 