import type { BackupPayload, DuplicateGroup, LinkDraft, LinkFilters, LinkStatus, SavedLink } from './types'

const STATUS_ORDER: LinkStatus[] = ['unread', 'reading', 'done', 'archived']

export function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl)
  parsed.hash = ''
  parsed.searchParams.sort()
  if (parsed.pathname !== '/') parsed.pathname = parsed.pathname.replace(/\/+$/, '')
  return parsed.toString().replace(/^https?:\/\/www\./, 'https://')
}

export function getDomain(rawUrl: string): string {
  return new URL(rawUrl).hostname.replace(/^www\./, '')
}

export function createSavedLink(draft: LinkDraft, now = new Date()): SavedLink {
  const savedAt = draft.savedAt ?? now.toISOString()
  return {
    id: crypto.randomUUID(),
    title: draft.title.trim() || getDomain(draft.url),
    url: draft.url,
    normalizedUrl: normalizeUrl(draft.url),
    domain: getDomain(draft.url),
    note: draft.note?.trim() ?? '',
    tags: normalizeTags(draft.tags ?? []),
    status: draft.status ?? 'unread',
    savedAt,
    updatedAt: now.toISOString(),
  }
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().replace(/^#/, '').toLowerCase()).filter(Boolean))]
}

export function filterLinks(links: SavedLink[], filters: LinkFilters = {}): SavedLink[] {
  const q = filters.query?.trim().toLowerCase()
  const tag = filters.tag?.trim().toLowerCase()
  return [...links]
    .filter((link) => !q || [link.title, link.url, link.domain, link.note, ...link.tags].join(' ').toLowerCase().includes(q))
    .filter((link) => !filters.status || filters.status === 'all' || link.status === filters.status)
    .filter((link) => !tag || link.tags.includes(tag))
    .sort((a, b) => {
      if (filters.sort === 'oldest') return a.savedAt.localeCompare(b.savedAt)
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      if (filters.sort === 'domain') return a.domain.localeCompare(b.domain) || b.savedAt.localeCompare(a.savedAt)
      return b.savedAt.localeCompare(a.savedAt)
    })
}

export function countByStatus(links: SavedLink[]): Record<LinkStatus, number> {
  return STATUS_ORDER.reduce((acc, status) => {
    acc[status] = links.filter((link) => link.status === status).length
    return acc
  }, {} as Record<LinkStatus, number>)
}

export function findDuplicateGroups(links: SavedLink[]): DuplicateGroup[] {
  const byUrl = new Map<string, SavedLink[]>()
  for (const link of links) byUrl.set(link.normalizedUrl, [...(byUrl.get(link.normalizedUrl) ?? []), link])
  return [...byUrl.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([normalizedUrl, group]) => ({ normalizedUrl, links: group.sort((a, b) => a.savedAt.localeCompare(b.savedAt)) }))
}

export function getReviewQueue(links: SavedLink[], limit = 5): SavedLink[] {
  return links
    .filter((link) => link.status === 'unread')
    .sort((a, b) => a.savedAt.localeCompare(b.savedAt))
    .slice(0, limit)
}

export function ageLabel(iso: string, now = new Date()): string {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000))
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 31) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function exportLinksMarkdown(links: SavedLink[]): string {
  const lines = ['# ReadLaterCleaner export', '', `Exported ${links.length} links.`, '']
  for (const link of links) {
    lines.push(`- [${link.title}](${link.url})`)
    lines.push(`  - Status: ${link.status}`)
    lines.push(`  - Domain: ${link.domain}`)
    if (link.tags.length) lines.push(`  - Tags: ${link.tags.map((tag) => `#${tag}`).join(' ')}`)
    if (link.note) lines.push(`  - Note: ${link.note}`)
  }
  return `${lines.join('\n')}\n`
}

export function exportBackupJSON(links: SavedLink[], now = new Date()): string {
  const payload: BackupPayload = { app: 'ReadLaterCleaner', version: 1, exportedAt: now.toISOString(), links }
  return JSON.stringify(payload, null, 2)
}

export function parseBackupJSON(text: string): SavedLink[] {
  const parsed = JSON.parse(text) as BackupPayload
  if (parsed.app !== 'ReadLaterCleaner' || parsed.version !== 1 || !Array.isArray(parsed.links)) {
    throw new Error('This is not a valid ReadLaterCleaner backup.')
  }
  return parsed.links.map((link) => ({
    ...link,
    normalizedUrl: link.normalizedUrl || normalizeUrl(link.url),
    domain: link.domain || getDomain(link.url),
    tags: normalizeTags(link.tags ?? []),
    status: STATUS_ORDER.includes(link.status) ? link.status : 'unread',
  }))
}

