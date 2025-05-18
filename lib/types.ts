export interface Note {
  id: string
  title: string
  content: string
  color: string
  date: string
  folderId: string
}

export interface Folder {
  id: string
  name: string
  icon: string
}
