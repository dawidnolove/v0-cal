"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Trash2, Calendar, Folder, Edit3, Check, X, Move } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Note, Folder as FolderType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface NoteCardProps {
  note: Note
  folders: FolderType[]
  onUpdate: (note: Note) => void
  onDelete: (id: string) => void
  onMove: (noteId: string, folderId: string) => void
  isSelected?: boolean
  onSelect?: () => void
  index?: number
  tabIndex?: number
  onDragStart?: (e: React.DragEvent, noteId: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, noteId: string) => void
}

// Color classes mapping - moved outside component to prevent recreation on each render
const colorClasses = {
  blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
}

export function NoteCard({
  note,
  folders,
  onUpdate,
  onDelete,
  onMove,
  isSelected,
  onSelect,
  index,
  tabIndex,
  onDragStart,
  onDragOver,
  onDrop,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Update local state when note prop changes
  useEffect(() => {
    setEditedTitle(note.title)
    setEditedContent(note.content)
  }, [note.title, note.content])

  // Auto-focus on title input when editing mode is activated
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditing])

  // Focus the card when it becomes selected
  useEffect(() => {
    if (isSelected && cardRef.current && !isEditing) {
      cardRef.current.focus()
    }
  }, [isSelected, isEditing])

  const handleSave = () => {
    onUpdate({
      ...note,
      title: editedTitle || "Untitled Note",
      content: editedContent,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(note.title)
    setEditedContent(note.content)
    setIsEditing(false)
  }

  const handleMoveToFolder = (folderId: string) => {
    onMove(note.id, folderId)
    setShowMoveDialog(false)
  }

  // Handle drag events
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, note.id)
    }
    e.dataTransfer.setData("noteId", note.id)
    setIsDragging(true)

    // Add a delay to apply the dragging class for visual feedback
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.classList.add("note-dragging")
      }
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (cardRef.current) {
      cardRef.current.classList.remove("note-dragging")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (onDragOver) {
      onDragOver(e)
    }

    // Add visual feedback for drop target
    if (cardRef.current && !cardRef.current.classList.contains("note-dragging")) {
      cardRef.current.classList.add("note-drop-target")
    }
  }

  const handleDragLeave = () => {
    if (cardRef.current) {
      cardRef.current.classList.remove("note-drop-target")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (onDrop) {
      onDrop(e, note.id)
    }

    // Remove visual feedback
    if (cardRef.current) {
      cardRef.current.classList.remove("note-drop-target")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === "Escape") {
        handleCancel()
      } else if (e.key === "Enter" && e.ctrlKey) {
        handleSave()
      }
    } else {
      if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        setIsEditing(true)
      } else if (e.key === "Delete") {
        e.preventDefault()
        onDelete(note.id)
      }
    }
  }

  return (
    <Card
      ref={cardRef}
      id={`note-${note.id}`}
      className={cn(
        "transition-all duration-200 hover:shadow-md note-focus-visible",
        colorClasses[note.color as keyof typeof colorClasses] || "bg-card",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect && onSelect()}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex || 0}
      data-index={index}
    >
      {isEditing ? (
        <>
          <CardHeader className="p-4 pb-0">
            <Input
              ref={titleInputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="font-medium text-lg bg-background/50"
              placeholder="Note title"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  contentTextareaRef.current?.focus()
                }
              }}
            />
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              ref={contentTextareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] bg-background/50"
              placeholder="Start typing..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          </CardContent>
          <CardFooter className="p-4 pt-0 justify-end space-x-2">
            {/* Swapped the order of Save and Cancel buttons */}
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">{note.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Button
                      data-edit-button
                      variant="ghost"
                      className="p-0 h-auto w-auto"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                    <Move className="h-4 w-4 mr-2" />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => onDelete(note.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4 whitespace-pre-wrap">{note.content}</CardContent>
          <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(note.date).toLocaleDateString()}
            </div>
          </CardFooter>
        </>
      )}

      {/* Move to Folder Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleMoveToFolder(folder.id)}
              >
                <Folder className="h-4 w-4 mr-2" />
                {folder.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
