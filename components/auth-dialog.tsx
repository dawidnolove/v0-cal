"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (username: string) => void
}

export function AuthDialog({ open, onOpenChange, onLogin }: AuthDialogProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Please fill in all fields")
      return
    }

    // In a real app, we would authenticate with a server
    // For now, we'll just simulate a successful login
    setError("")
    onLogin(username)

    // Reset form
    setUsername("")
    setPassword("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegister ? "Create an account" : "Login to Stark Notes"}</DialogTitle>
          <DialogDescription>
            {isRegister
              ? "Create an account to sync your notes across devices."
              : "Login to access your notes from anywhere."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button type="button" variant="link" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Already have an account?" : "Need an account?"}
            </Button>
            <Button type="submit">{isRegister ? "Register" : "Login"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
