"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

// Use the background colors defined in globals.css
// Light mode: --background: 0 0% 100%; -> #ffffff
// Dark mode: -> #08080a
const lightThemeColor = "#ffffff"
const darkThemeColor = "#08080a"

export function ThemeMetaUpdater() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    // Select ALL theme-color meta tags
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')

    if (metaThemeColors.length > 0) {
      const color = resolvedTheme === "dark" ? darkThemeColor : lightThemeColor
      
      // Update all theme-color meta tags
      metaThemeColors.forEach(meta => {
        meta.setAttribute("content", color)
      })
      
      console.log(`Theme color updated to: ${color} for ${resolvedTheme} theme`)
    } else {
      // If no meta tags exist, create one
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      newMeta.content = resolvedTheme === "dark" ? darkThemeColor : lightThemeColor
      document.head.appendChild(newMeta)
      console.warn("No theme-color meta tags found, created one.")
    }
  }, [resolvedTheme])

  return null
} 