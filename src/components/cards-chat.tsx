"use client"

import * as React from "react"
import { Settings, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle } from "lucide-react"

// Add this interface near the top
interface CustomWorkoutSet {
  value: string;
  notes: string;
}

interface CustomWorkoutExercise {
  exerciseName: string;
  sets: CustomWorkoutSet[];
  volume: number;
}

interface CustomWorkoutData {
  name: string;
  date: string;
  exercises: CustomWorkoutExercise[];
  lastPerformed: string;
}

// Update the Message interface
interface Message {
  role: "user" | "assistant";
  // Content can be a string (text message/error) or a structured workout
  content: string | CustomWorkoutData;
}

// Define the WorkoutDisplay component props
interface WorkoutDisplayProps {
  workout: CustomWorkoutData;
  onSave: () => void; // Function to call when save button is clicked
  isSaved: boolean; // Whether this workout has already been saved
}

// Component to display the workout table
const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ workout, onSave, isSaved }) => {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-semibold">{workout.name}</h4>
      <p className="text-xs text-muted-foreground">Date: {workout.date}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exercise</TableHead>
            <TableHead>Sets</TableHead>
            <TableHead className="text-right">Notes</TableHead>
            {/* <TableHead className="text-right">Volume</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {workout.exercises.map((exercise, exIndex) => (
            <TableRow key={exIndex}>
              <TableCell className="font-medium">{exercise.exerciseName}</TableCell>
              <TableCell>
                {exercise.sets.map((set, setIndex) => (
                   <div key={setIndex} className="text-xs">{set.value}</div>
                 ))}
              </TableCell>
              <TableCell className="text-right text-xs">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex}>{set.notes || '-'}</div>
                ))}
              </TableCell>
              {/* <TableCell className="text-right">{exercise.volume}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        onClick={onSave}
        disabled={isSaved}
        size="sm"
        variant={isSaved ? "secondary" : "default"}
        className="mt-2 w-full"
      >
        {isSaved ? <><CheckCircle className="mr-2 h-4 w-4" /> Saved</> : "Save Workout"}
      </Button>
    </div>
  );
};

export function CardsChat() {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, how can I help you plan your workout?",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedMessageIndices, setSavedMessageIndices] = React.useState<Set<number>>(new Set());
  const inputLength = input.trim().length

  // --- Updated API Interaction Logic ---
  const handleSend = async () => {
    if (inputLength === 0 || isLoading) return;

    const newUserMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: currentMessages }),
      });

      setIsLoading(false);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `API request failed with status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const assistantResponseContent = data.response;

      if (assistantResponseContent) {
        try {
          const workoutJson: CustomWorkoutData = JSON.parse(assistantResponseContent);
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: workoutJson },
          ]);
          console.log("Received Workout JSON:", workoutJson);
        } catch (parseError) {
          console.error("Could not parse workout JSON:", parseError);
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: `Failed to parse workout: ${assistantResponseContent}` },
          ]);
        }
      } else {
        throw new Error("Received empty response from API");
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching response:", error);
      let errorMessage = "Sorry, I couldn't get a response. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: errorMessage },
      ]);
    }
  };

  // Function to save workout to localStorage
  const handleSaveWorkout = (workoutToSave: CustomWorkoutData, messageIndex: number) => {
    if (savedMessageIndices.has(messageIndex)) return;

    console.log("Saving workout:", workoutToSave);
    try {
      const existingWorkoutsRaw = localStorage.getItem("customWorkouts");
      const existingWorkouts: CustomWorkoutData[] = existingWorkoutsRaw ? JSON.parse(existingWorkoutsRaw) : [];
      const updatedWorkouts = [...existingWorkouts, workoutToSave];
      localStorage.setItem("customWorkouts", JSON.stringify(updatedWorkouts));
      console.log("Workout saved successfully!");
      setSavedMessageIndices(prev => new Set(prev).add(messageIndex));
    } catch (error) {
      console.error("Failed to parse or save workouts to localStorage:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Error saving workout to local storage." },
      ]);
    }
  };

  return (
    <>
      <Card className="w-full h-full flex flex-col justify-between m-0 p-0 bg-transparent border-none shadow-none overflow-hidden">
        {/* Simplified Header */}
        <CardHeader className="flex flex-row items-center m-0 p-0">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/ai-avatar.png" alt="AI Coach" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">AI Coach</p>
              <p className="text-sm text-muted-foreground">Ready to help</p>
            </div>
          </div>
          {/* Settings Button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="ml-auto rounded-full"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Model Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>Model Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>

        {/* Chat Message Area */}
        <CardContent className="m-0 p-0 flex-grow overflow-y-auto pb-28">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm break-words",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted whitespace-pre-wrap" // Added whitespace-pre-wrap for assistant
                )}
              >
                {typeof message.content === 'string' ? (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                ) : (
                  <WorkoutDisplay
                    workout={message.content}
                    onSave={() => handleSaveWorkout(message.content as CustomWorkoutData, index)}
                    isSaved={savedMessageIndices.has(index)}
                  />
                )}
              </div>
            ))}
             {isLoading && (
               <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted animate-pulse">
                 Generating workout...
               </div>
             )}
          </div>
        </CardContent>

        {/* Input Area */}
        <CardFooter className="m-0 p-0 pt-2 absolute bottom-[5.5rem] left-4 right-4 bg-background pb-safe">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="e.g. Generate an upper body workout"
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={inputLength === 0 || isLoading}>
              <Send />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Settings Dialog (Placeholder) */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Model Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Model parameter settings (like temperature) will go here.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
