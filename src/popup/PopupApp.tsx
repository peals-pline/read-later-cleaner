import { useEffect, useMemo, useState } from 'react'
import { addLink, getLinks } from '../storage/repository'
import { getCurrentTabDraft, getCurrentWindowTabDrafts, openOptionsPage } from '../extension/tabs'
import { ageLabel, countByStatus } from '../domain/links'
import type { LinkDraft, SavedLink } from '../domain/types'
import { Button } from '../ui/components'
import { Icon } from '../ui/icons'

export function PopupApp() {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [current, setCurrent] = useState<LinkDraft | null>(null)
  const [message, setMessage] = useState('')
  const counts = useMemo(() => countByStatus(links), [links])

  useEffect(() => {
    getLinks().then(setLinks)
    getCurrentTabDraft().then(setCurrent)
  }, [])

  async function saveCurrent() {
    if (!current) return
    const result = await addLink(current)
    setLinks(await getLinks())
    setMessage(result.duplicate ? 'Saved as a duplicate' : 'Saved current tab')
  }

  async function saveAllTabs() {
    const drafts = await getCurrentWindowTabDrafts()
    for (const draft of drafts) await addLink(draft)
    setLinks(await getLinks())
    setMessage(`Saved ${drafts.length} tabs`)
  }

  return (
    <div className="w-[380px] bg-paper p-5 text-ink">
      <div className="mb-4 flex items-center justify-between">
        <div className="grid h-8 w-6 place-items-center rounded-sm border-2 border-ember text-ember"><Icon name="Bookmark" /></div>
        <button className="text-muted hover:text-ink" onClick={openOptionsPage} aria-label="Open settings"><Icon name="Settings" /></button>
      </div>
      <h1 className="font-serif text-3xl leading-tight">Save this page</h1>
      <p className="mt-1 truncate text-sm text-muted">{current?.url ? new URL(current.url).hostname.replace(/^www\./, '') : 'Open a normal tab to save it.'}</p>
      <Button className="mt-5 w-full" variant="primary" icon="Bookmark" onClick={saveCurrent} disabled={!current}>Save current tab</Button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button icon="Copy" onClick={saveAllTabs}>Save all tabs</Button>
        <Button icon="FileText" onClick={() => setMessage('Notes can be edited in the full library')}>Add note</Button>
      </div>
      {message && <div className="mt-3 rounded-md bg-[#fff1ea] px-3 py-2 text-sm text-ember">{message}</div>}
      <div className="my-5 h-px bg-rule" />
      <div className="mb-4 flex justify-between text-sm"><span>Recent links</span><span className="text-muted">Unread {counts.unread}</span></div>
      <div className="space-y-4">
        {links.slice(0, 5).map((link) => (
          <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ember" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{link.title}</span>
              <span className="block text-xs text-muted">{link.domain} · {ageLabel(link.savedAt)}</span>
            </span>
          </a>
        ))}
      </div>
      <Button className="mt-6 w-full justify-between" icon="PanelRightOpen" onClick={openOptionsPage}>Open full library</Button>
      <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted"><Icon name="ShieldCheck" />Private by design. Stored only on this device.</p>
    </div>
  )
}

