"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useState } from "react"

interface Message {
  text: string
  sender: 'user' | 'bot'
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { text: input, sender: 'user' }])
    setInput('')
  }

  return (
    <Card className="w-[400px] h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`mb-4 flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
} 