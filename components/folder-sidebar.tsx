"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Layers,
  Calendar,
  User,
  Briefcase,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Folder,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react"
import type { Folder as FolderType } from "@/lib/types"
import { cn, generateId } from "@/lib/utils"

interface FolderSidebarProps {
  folders: FolderType[]
  activeFolder: string | null
  setActiveFolder: (id: string | null) => void
  setFolders: (folders: FolderType[]) => void
}

export function FolderSidebar({ folders, activeFolder, setActiveFolder, setFolders }: FolderSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editedFolderName, setEditedFolderName] = useState("")

  // Protected folders that cannot be deleted
  const PROTECTED_FOLDERS = ["all", "calendar"]

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "layers":
        return <Layers className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "briefcase":
        return <Briefcase className="h-4 w-4" />
      default:
        return <Folder className="h-4 w-4" />
    }
  }

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderType = {
        id: generateId(),
        name: newFolderName,
        icon: "folder",
      }
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setIsAddingFolder(false)
    }
  }

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id)
    setEditedFolderName(folder.name)
  }

  const handleSaveEdit = () => {
    if (editingFolderId && editedFolderName.trim()) {
      setFolders(
        folders.map((folder) => (folder.id === editingFolderId ? { ...folder, name: editedFolderName } : folder)),
      )
      setEditingFolderId(null)
    }
  }

  const handleDeleteFolder = (id: string) => {
    // Don't allow deleting protected folders
    if (PROTECTED_FOLDERS.includes(id)) return

    setFolders(folders.filter((folder) => folder.id !== id))
    if (activeFolder === id) {
      setActiveFolder("all")
    }
  }

  return (
    <div
      className={cn(
        "h-full border-r bg-muted/10 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="font-semibold">Folders</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {folders.map((folder) => (
            <div key={folder.id} className="mb-1">
              {editingFolderId === folder.id ? (
                <div className="flex items-center space-x-1 p-1">
                  <Input
                    value={editedFolderName}
                    onChange={(e) => setEditedFolderName(e.target.value)}
                    className="h-8 flex-1"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFolderId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant={activeFolder === folder.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start mb-1 group", collapsed && "justify-center px-2")}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  {getIcon(folder.icon)}
                  {!collapsed && (
                    <>
                      <span className="ml-2">{folder.name}</span>
                      {!PROTECTED_FOLDERS.includes(folder.id) && (
                        <div className="ml-auto flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditFolder(folder)
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t">
          {isAddingFolder ? (
            <div className="flex items-center space-x-1">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="h-8 flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFolder()
                  if (e.key === "Escape") setIsAddingFolder(false)
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddFolder}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingFolder(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddingFolder(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
