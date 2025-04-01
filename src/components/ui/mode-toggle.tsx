"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark")
        break
      case "dark":
        setTheme("system")
        break
      default:
        setTheme("light")
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme}>
      {theme === "light" && (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      {theme === "dark" && (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {theme === "system" && (
        <Monitor className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
