import type { LinkDraft } from '../domain/types'

export async function getCurrentTabDraft(): Promise<LinkDraft | null> {
  if (typeof chrome === 'undefined' || !chrome.tabs) return null
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url || tab.url.startsWith('chrome://')) return null
  return { title: tab.title || tab.url, url: tab.url }
}

export async function getCurrentWindowTabDrafts(): Promise<LinkDraft[]> {
  if (typeof chrome === 'undefined' || !chrome.tabs) return []
  const tabs = await chrome.tabs.query({ currentWindow: true })
  return tabs
    .filter((tab) => tab.url && !tab.url.startsWith('chrome://'))
    .map((tab) => ({ title: tab.title || tab.url!, url: tab.url! }))
}

export function openOptionsPage(): void {
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open('/options.html', '_blank')
  }
}

