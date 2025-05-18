"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { key: "N", description: "Create a new note" },
    { key: "?", description: "Show keyboard shortcuts" },
    { key: "D", description: "Toggle dark/light mode" },
    { key: "↑/↓/←/→", description: "Navigate between notes" },
    { key: "Enter", description: "Edit selected note" },
    { key: "Delete", description: "Delete selected note" },
    { key: "Ctrl+↑/↓", description: "Move note up/down" },
    { key: "Ctrl+Enter", description: "Save note while editing" },
    { key: "Esc", description: "Cancel editing" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Boost your productivity with these keyboard shortcuts.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-muted rounded-md font-mono text-sm">{shortcut.key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
