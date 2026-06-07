import { demoLinks } from '../data/demo'
import { createSavedLink, normalizeUrl } from '../domain/links'
import type { LinkDraft, SavedLink } from '../domain/types'

const STORAGE_KEY = 'readlatercleaner.links'

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

async function readRaw(): Promise<SavedLink[] | undefined> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    return result[STORAGE_KEY] as SavedLink[] | undefined
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as SavedLink[] : undefined
}

async function writeRaw(links: SavedLink[]): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: links })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}

export async function getLinks(): Promise<SavedLink[]> {
  const links = await readRaw()
  if (links?.length) return links
  const seeded = demoLinks()
  await writeRaw(seeded)
  return seeded
}

export async function setLinks(links: SavedLink[]): Promise<SavedLink[]> {
  await writeRaw(links)
  return links
}

export async function addLink(draft: LinkDraft): Promise<{ link: SavedLink; duplicate: boolean }> {
  const links = await getLinks()
  const link = createSavedLink(draft)
  const duplicate = links.some((item) => item.normalizedUrl === normalizeUrl(draft.url))
  await setLinks([link, ...links])
  return { link, duplicate }
}

export async function updateLink(id: string, patch: Partial<SavedLink>): Promise<SavedLink[]> {
  const links = await getLinks()
  return setLinks(links.map((link) => link.id === id ? { ...link, ...patch, updatedAt: new Date().toISOString() } : link))
}

export async function removeLink(id: string): Promise<SavedLink[]> {
  const links = await getLinks()
  return setLinks(links.filter((link) => link.id !== id))
}

export async function mergeDuplicateGroup(primaryId: string, duplicateIds: string[]): Promise<SavedLink[]> {
  const links = await getLinks()
  const duplicates = links.filter((link) => duplicateIds.includes(link.id))
  return setLinks(links
    .filter((link) => !duplicateIds.includes(link.id))
    .map((link) => link.id === primaryId
      ? {
          ...link,
          tags: [...new Set([...link.tags, ...duplicates.flatMap((item) => item.tags)])],
          note: [link.note, ...duplicates.map((item) => item.note)].filter(Boolean).join('\n'),
          updatedAt: new Date().toISOString(),
        }
      : link))
}

