"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { PlusCircle, Moon, Sun, LogIn, LogOut, Keyboard, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { NoteCard } from "@/components/note-card"
import { FolderSidebar } from "@/components/folder-sidebar"
import { AuthDialog } from "@/components/auth-dialog"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Note, Folder } from "@/lib/types"
import { generateId } from "@/lib/utils"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [activeFolder, setActiveFolder] = useState<string | null>("all")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isNewNoteBeingCreated, setIsNewNoteBeingCreated] = useState(false)
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const notesGridRef = useRef<HTMLDivElement>(null)

  // Local storage hooks
  const [notes, setNotes] = useLocalStorage<Note[]>("stark-notes", [])
  const [folders, setFolders] = useLocalStorage<Folder[]>("stark-folders", [
    { id: "all", name: "All Notes", icon: "layers" },
    { id: "calendar", name: "Calendar", icon: "calendar" },
    { id: "personal", name: "Personal", icon: "user" },
    { id: "work", name: "Work", icon: "briefcase" },
  ])

  // Initialize with some sample notes if empty
  useEffect(() => {
    if (notes.length === 0 && isLoggedIn === false) {
      setNotes([
        {
          id: generateId(),
          title: "Welcome to Stark Notes",
          content: "Swipe, drag, and organize your notes like Tony Stark would.",
          color: "blue",
          date: new Date().toISOString(),
          folderId: "all",
        },
        {
          id: generateId(),
          title: "Keyboard Shortcuts",
          content: "Press '?' to view all available shortcuts.",
          color: "amber",
          date: new Date().toISOString(),
          folderId: "all",
        },
      ])
    }
  }, [notes.length, isLoggedIn, setNotes])

  // Filter notes based on active folder and selected date
  const filteredNotes = notes.filter((note) => {
    if (activeFolder === "calendar") {
      return date && new Date(note.date).toDateString() === date.toDateString()
    }
    return activeFolder ? note.folderId === activeFolder : true
  })

  // Add a new note
  const addNote = () => {
    setIsNewNoteBeingCreated(true)
    const newNoteId = generateId()
    const newNote: Note = {
      id: newNoteId,
      title: "",
      content: "",
      color: ["blue", "amber", "green", "red", "purple"][Math.floor(Math.random() * 5)],
      date: date ? date.toISOString() : new Date().toISOString(),
      folderId: activeFolder || "all",
    }
    setNotes([newNote, ...notes])
    setSelectedNoteId(newNoteId)

    // Wait for the DOM to update, then trigger edit mode
    setTimeout(() => {
      const noteElement = document.getElementById(`note-${newNoteId}`)
      if (noteElement) {
        noteElement.click() // Select the note
        setTimeout(() => {
          // Simulate Enter key to start editing
          const event = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
          })
          noteElement.dispatchEvent(event)
          setIsNewNoteBeingCreated(false)
        }, 50)
      }
    }, 50)
  }

  // Update a note
  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
  }

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (selectedNoteId === id) {
      setSelectedNoteId(null)
    }
  }

  // Move note to a folder
  const moveNoteToFolder = (noteId: string, folderId: string) => {
    setNotes(notes.map((note) => (note.id === noteId ? { ...note, folderId } : note)))
  }

  // Swap note positions
  const swapNotePositions = (direction: "up" | "down") => {
    if (!selectedNoteId) return

    const noteIndex = notes.findIndex((note) => note.id === selectedNoteId)
    if (noteIndex === -1) return

    const newNotes = [...notes]

    if (direction === "up" && noteIndex > 0) {
      // Swap with the note above
      ;[newNotes[noteIndex], newNotes[noteIndex - 1]] = [newNotes[noteIndex - 1], newNotes[noteIndex]]
      setNotes(newNotes)
    } else if (direction === "down" && noteIndex < notes.length - 1) {
      // Swap with the note below
      ;[newNotes[noteIndex], newNotes[noteIndex + 1]] = [newNotes[noteIndex + 1], newNotes[noteIndex]]
      setNotes(newNotes)
    }
  }

  // Navigate between notes with arrow keys
  const navigateNotes = (direction: "up" | "down" | "left" | "right") => {
    if (!notesGridRef.current || filteredNotes.length === 0) return

    // If no note is selected, select the first one
    if (!selectedNoteId) {
      setSelectedNoteId(filteredNotes[0].id)
      return
    }

    const noteElements = Array.from(notesGridRef.current.querySelectorAll("[data-index]"))
    if (noteElements.length === 0) return

    const currentIndex = noteElements.findIndex((el) => el.id === `note-${selectedNoteId}`)

    if (currentIndex === -1) return

    let nextIndex = currentIndex
    const columns = getComputedStyle(notesGridRef.current).gridTemplateColumns.split(" ").length

    switch (direction) {
      case "up":
        nextIndex = Math.max(0, currentIndex - columns)
        break
      case "down":
        nextIndex = Math.min(noteElements.length - 1, currentIndex + columns)
        break
      case "left":
        nextIndex = Math.max(0, currentIndex - 1)
        break
      case "right":
        nextIndex = Math.min(noteElements.length - 1, currentIndex + 1)
        break
    }

    if (nextIndex !== currentIndex) {
      const nextNoteId = noteElements[nextIndex].id.replace("note-", "")
      setSelectedNoteId(nextNoteId)

      // Focus the next note
      setTimeout(() => {
        const nextNoteElement = document.getElementById(`note-${nextNoteId}`)
        if (nextNoteElement) {
          nextNoteElement.focus()
        }
      }, 10)
    }
  }

  // Handle drag and drop
  const handleNoteDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNoteId(noteId)
  }

  const handleNoteDrop = (e: React.DragEvent, targetNoteId: string) => {
    e.preventDefault()

    if (!draggedNoteId || draggedNoteId === targetNoteId) return

    // Find the indices of the dragged and target notes
    const draggedIndex = notes.findIndex((note) => note.id === draggedNoteId)
    const targetIndex = notes.findIndex((note) => note.id === targetNoteId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Create a new array with the dragged note moved to the target position
    const newNotes = [...notes]
    const [draggedNote] = newNotes.splice(draggedIndex, 1)
    newNotes.splice(targetIndex, 0, draggedNote)

    setNotes(newNotes)
    setDraggedNoteId(null)
  }

  // Handle dropping a note on the notes grid (at the end)
  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedNoteId) return

    // Find the dragged note
    const draggedIndex = notes.findIndex((note) => note.id === draggedNoteId)

    if (draggedIndex === -1) return

    // Move the note to the end of the list
    const newNotes = [...notes]
    const [draggedNote] = newNotes.splice(draggedIndex, 1)
    newNotes.push(draggedNote)

    setNotes(newNotes)
    setDraggedNoteId(null)
  }

  // Keyboard shortcuts
  useHotkeys([
    { key: "n", callback: addNote },
    { key: "?", callback: () => setShowKeyboardShortcuts(true) },
    { key: "d", callback: () => setTheme(theme === "dark" ? "light" : "dark") },
    {
      key: "Delete",
      callback: () => {
        if (selectedNoteId) deleteNote(selectedNoteId)
      },
    },
    {
      key: "ArrowUp",
      callback: (e) => {
        if (e.ctrlKey) {
          e.preventDefault()
          swapNotePositions("up")
        } else {
          e.preventDefault()
          navigateNotes("up")
        }
      },
    },
    {
      key: "ArrowDown",
      callback: (e) => {
        if (e.ctrlKey) {
          e.preventDefault()
          swapNotePositions("down")
        } else {
          e.preventDefault()
          navigateNotes("down")
        }
      },
    },
    {
      key: "ArrowLeft",
      callback: (e) => {
        e.preventDefault()
        navigateNotes("left")
      },
    },
    {
      key: "ArrowRight",
      callback: (e) => {
        e.preventDefault()
        navigateNotes("right")
      },
    },
  ])

  // Update keyboard shortcuts dialog
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

      if (e.key === "?") {
        setShowKeyboardShortcuts(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <FolderSidebar
        folders={folders}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
        setFolders={setFolders}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight">Stark Notes</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => (isLoggedIn ? setIsLoggedIn(false) : setShowAuthDialog(true))}>
              {isLoggedIn ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout ({username})
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Notes Section */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {folders.find((f) => f.id === activeFolder)?.name || "All Notes"}
              </h2>
              <Button onClick={addNote}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>

            {/* Notes Grid */}
            <div
              ref={notesGridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleGridDrop}
            >
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  folders={folders}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onMove={moveNoteToFolder}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => setSelectedNoteId(note.id)}
                  index={index}
                  tabIndex={0}
                  onDragStart={handleNoteDragStart}
                  onDrop={handleNoteDrop}
                />
              ))}
              {filteredNotes.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <p className="mb-2">No notes in this view</p>
                  <Button variant="outline" onClick={addNote}>
                    Create your first note
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="w-80 border-l p-4 hidden md:block overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />

            {/* Calendar Notes Preview */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                {date
                  ? date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
                  : "Select a date"}
              </h3>
              <div className="space-y-2">
                {notes
                  .filter((note) => date && new Date(note.date).toDateString() === date.toDateString())
                  .map((note) => (
                    <div
                      key={note.id}
                      className={`p-2 rounded-md text-sm bg-${note.color}-100 dark:bg-${note.color}-900/20 border border-${note.color}-200 dark:border-${note.color}-800 flex justify-between items-center`}
                    >
                      <span>{note.title || "Untitled Note"}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 opacity-50 hover:opacity-100"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onLogin={(username) => {
          setIsLoggedIn(true)
          setUsername(username)
          setShowAuthDialog(false)
        }}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />
    </div>
  )
}
