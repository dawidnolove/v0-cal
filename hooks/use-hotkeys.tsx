"use client"

import { useEffect } from "react"

interface Hotkey {
  key: string
  callback: (e: KeyboardEvent) => void
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      for (const hotkey of hotkeys) {
        const keys = hotkey.key.split(" ")
        const matchesKey = keys.includes(e.key)
        const matchesModifiers =
          (hotkey.ctrlKey === undefined || hotkey.ctrlKey === e.ctrlKey) &&
          (hotkey.altKey === undefined || hotkey.altKey === e.altKey) &&
          (hotkey.shiftKey === undefined || hotkey.shiftKey === e.shiftKey)

        if (matchesKey && matchesModifiers) {
          hotkey.callback(e)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hotkeys])
}
