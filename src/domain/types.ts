export type LinkStatus = 'unread' | 'reading' | 'done' | 'archived'

export interface SavedLink {
  id: string
  title: string
  url: string
  normalizedUrl: string
  domain: string
  note: string
  tags: string[]
  status: LinkStatus
  savedAt: string
  updatedAt: string
}

export interface LinkDraft {
  title: string
  url: string
  note?: string
  tags?: string[]
  status?: LinkStatus
  savedAt?: string
}

export interface LinkFilters {
  query?: string
  status?: LinkStatus | 'all'
  tag?: string
  sort?: 'newest' | 'oldest' | 'title' | 'domain'
}

export interface DuplicateGroup {
  normalizedUrl: string
  links: SavedLink[]
}

export interface BackupPayload {
  app: 'ReadLaterCleaner'
  version: 1
  exportedAt: string
  links: SavedLink[]
}

