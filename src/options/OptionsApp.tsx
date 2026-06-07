import { useEffect, useMemo, useRef, useState } from 'react'
import { ageLabel, countByStatus, exportBackupJSON, exportLinksMarkdown, filterLinks, findDuplicateGroups, getReviewQueue, parseBackupJSON } from '../domain/links'
import type { LinkStatus, SavedLink } from '../domain/types'
import { getLinks, mergeDuplicateGroup, removeLink, setLinks, updateLink } from '../storage/repository'
import { Button, LinkRow, Tag } from '../ui/components'
import { Icon, type IconName } from '../ui/icons'

const nav: Array<[View, string, IconName]> = [
  ['inbox', 'Inbox', 'Inbox'],
  ['review', 'Review', 'Star'],
  ['duplicates', 'Duplicates', 'Copy'],
  ['archive', 'Archive', 'Archive'],
  ['settings', 'Settings', 'Settings'],
]

type View = 'inbox' | 'review' | 'duplicates' | 'archive' | 'settings'

export function OptionsApp() {
  const [links, setLocalLinks] = useState<SavedLink[]>([])
  const [view, setView] = useState<View>('inbox')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<LinkStatus | 'all'>('all')
  const [selected, setSelected] = useState<SavedLink | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getLinks().then(setLocalLinks) }, [])
  const counts = useMemo(() => countByStatus(links), [links])
  const duplicates = useMemo(() => findDuplicateGroups(links), [links])
  const review = useMemo(() => getReviewQueue(links), [links])
  const visibleLinks = useMemo(() => filterLinks(links, { query, status: view === 'archive' ? 'archived' : status, sort: 'newest' }), [links, query, status, view])

  async function refresh(next: SavedLink[]) {
    setLocalLinks(next)
    if (selected) setSelected(next.find((link) => link.id === selected.id) ?? null)
  }

  async function setStatusFor(id: string, nextStatus: LinkStatus) {
    await refresh(await updateLink(id, { status: nextStatus }))
  }

  async function deleteLink(id: string) {
    await refresh(await removeLink(id))
  }

  function download(name: string, text: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function importBackup(file: File) {
    const imported = parseBackupJSON(await file.text())
    await refresh(await setLinks(imported))
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="flex flex-col border-r border-rule px-5 py-9">
          <div className="mb-12 flex items-start gap-3">
            <div className="grid h-10 w-7 place-items-center rounded-sm border-2 border-ember text-ember"><Icon name="Bookmark" /></div>
            <div>
              <div className="font-serif text-2xl leading-none">ReadLaterCleaner</div>
              <div className="mt-1 text-sm text-muted">Clean. Organize. Read.</div>
            </div>
          </div>
          <nav className="space-y-2">
            {nav.map(([id, label, icon]) => (
              <button key={id} onClick={() => setView(id)} className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left transition ${view === id ? 'bg-[#f1e9dd] text-ink' : 'text-muted hover:bg-[#f6efe6] hover:text-ink'}`}>
                <span className="flex items-center gap-3"><Icon name={icon} />{label}</span>
                {id === 'inbox' && <span className="rounded-full bg-ember px-2 py-0.5 text-xs text-white">{links.length}</span>}
                {id === 'review' && <span className="rounded-full bg-ember px-2 py-0.5 text-xs text-white">{review.length}</span>}
                {id === 'duplicates' && duplicates.length > 0 && <span className="rounded-full bg-ember px-2 py-0.5 text-xs text-white">{duplicates.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-lg border border-rule bg-white/50 p-5 text-sm">
            <div className="mb-3 flex items-center gap-2 font-medium"><Icon name="ShieldCheck" />Your data stays local</div>
            <p className="leading-relaxed text-muted">Links are stored with chrome.storage.local. No account, no cloud, no tracking.</p>
          </div>
        </aside>

        <main className="px-10 py-10">
          <div className="mb-7 flex items-start justify-between gap-8">
            <div>
              <div className="mb-5 text-sm font-semibold text-ember">{view === 'inbox' ? 'Inbox' : nav.find(([id]) => id === view)?.[1]}</div>
              <h1 className="font-serif text-[52px] leading-none tracking-[-0.04em]">Your reading backlog</h1>
              <p className="mt-5 text-lg text-muted">Keep what matters. Let go of the rest.</p>
            </div>
            <div className="flex flex-col items-end gap-8">
              <div className="flex gap-3">
                <input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importBackup(event.target.files[0])} />
                <Button icon="Upload" onClick={() => fileRef.current?.click()}>Import / Export</Button>
                <Button icon="MoreHorizontal" aria-label="More actions" />
              </div>
              {view === 'inbox' && <Button variant="primary" className="px-6 py-3 text-base" onClick={() => setView('review')}>Review five old links</Button>}
            </div>
          </div>

          {view === 'review' ? (
            <ReviewPanel links={review} onStatus={setStatusFor} onDelete={deleteLink} />
          ) : view === 'duplicates' ? (
            <DuplicatesPanel groups={duplicates} onMerge={async (primary, rest) => refresh(await mergeDuplicateGroup(primary, rest))} onDelete={deleteLink} />
          ) : view === 'settings' ? (
            <SettingsPanel links={links} onMarkdown={() => download('readlatercleaner-links.md', exportLinksMarkdown(links), 'text/markdown')} onBackup={() => download('readlatercleaner-backup.json', exportBackupJSON(links), 'application/json')} />
          ) : (
            <>
              <div className="mb-7 flex gap-3">
                <label className="flex h-12 flex-1 items-center gap-3 rounded-md border border-rule bg-white/60 px-4 text-muted focus-within:ring-2 focus-within:ring-ember/20">
                  <Icon name="Search" />
                  <input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, URL, domain, tag or note..." />
                </label>
                <Button icon="SlidersHorizontal">Filters</Button>
              </div>
              <div className="mb-5 flex border-b border-rule text-sm">
                {(['all', 'unread', 'reading', 'done', 'archived'] as const).map((item) => (
                  <button key={item} onClick={() => setStatus(item)} className={`mr-12 border-b-2 px-1 pb-4 capitalize ${status === item ? 'border-ember text-ink' : 'border-transparent text-muted'}`}>
                    {item} <span className="ml-1 rounded-full border border-rule px-2 py-0.5 text-xs">{item === 'all' ? links.length : counts[item]}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[34px_1.4fr_.8fr_80px_.8fr_1.1fr_112px_34px] gap-4 border-b border-rule px-2 pb-3 text-xs font-medium text-muted">
                <span /><span>Title</span><span>Domain</span><span>Saved</span><span>Tags</span><span>Note</span><span>Status</span><span />
              </div>
              {visibleLinks.map((link) => <LinkRow key={link.id} link={link} selected={selected?.id === link.id} onSelect={() => setSelected(link)} onStatus={(next) => setStatusFor(link.id, next)} onDelete={() => deleteLink(link.id)} />)}
              <div className="mt-8 text-center text-sm text-muted">Showing {Math.min(visibleLinks.length, 7)} of {visibleLinks.length}</div>
            </>
          )}
        </main>

        <aside className="border-l border-rule bg-[#f7f1e8] px-6 py-10">
          <div className="sticky top-8 rounded-xl border border-rule bg-white/80 p-5 shadow-editorial">
            <div className="mb-4 flex items-center justify-between">
              <div className="grid h-8 w-6 place-items-center rounded-sm border-2 border-ember text-ember"><Icon name="Bookmark" /></div>
              <Icon name="Settings" className="h-5 w-5 text-muted" />
            </div>
            <h2 className="font-serif text-3xl">Save this page</h2>
            <p className="mt-1 text-sm text-muted">{selected?.domain ?? 'current tab'}</p>
            <Button className="mt-5 w-full" variant="primary" icon="Bookmark">Save current tab</Button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button icon="Copy">Save all tabs</Button>
              <Button icon="FileText">Add note</Button>
            </div>
            <div className="my-5 h-px bg-rule" />
            <div className="mb-4 flex justify-between text-sm"><span>Recent links</span><span className="text-muted">Unread {counts.unread}</span></div>
            <div className="space-y-4">
              {links.slice(0, 5).map((link) => (
                <button key={link.id} onClick={() => setSelected(link)} className="flex w-full items-start gap-3 text-left">
                  <span className="mt-1 h-2 w-2 rounded-full bg-ember" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{link.title}</span>
                    <span className="block text-xs text-muted">{link.domain} · {ageLabel(link.savedAt)}</span>
                  </span>
                </button>
              ))}
            </div>
            <Button className="mt-6 w-full justify-between" icon="PanelRightOpen" onClick={() => window.scrollTo({ top: 0 })}>Open full library</Button>
            <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted"><Icon name="ShieldCheck" />Private by design. Stored only on this device.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ReviewPanel({ links, onStatus, onDelete }: { links: SavedLink[]; onStatus: (id: string, status: LinkStatus) => void; onDelete: (id: string) => void }) {
  if (!links.length) return <EmptyState title="No old unread links" text="Your review queue is clear. Save a few links and come back later." />
  return (
    <div className="space-y-4">
      <div className="mb-6 rounded-lg border border-rule bg-white/60 p-5">
        <h2 className="font-serif text-3xl">Review five old links</h2>
        <p className="mt-2 text-muted">A short session for your oldest unread saves.</p>
      </div>
      {links.map((link) => (
        <div key={link.id} className="rounded-lg border border-rule bg-white/60 p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-2 text-sm text-ember">{link.domain} · saved {ageLabel(link.savedAt)}</div>
              <h3 className="font-serif text-3xl leading-tight">{link.title}</h3>
              <p className="mt-3 max-w-2xl text-muted">{link.note || 'No note yet.'}</p>
              <div className="mt-4 flex gap-2">{link.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Button onClick={() => onStatus(link.id, 'reading')}>Keep</Button>
              <Button onClick={() => onStatus(link.id, 'done')} variant="primary">Done</Button>
              <Button onClick={() => onStatus(link.id, 'archived')}>Archive</Button>
              <Button onClick={() => onDelete(link.id)} variant="danger">Delete</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DuplicatesPanel({ groups, onMerge, onDelete }: { groups: ReturnType<typeof findDuplicateGroups>; onMerge: (primary: string, rest: string[]) => void; onDelete: (id: string) => void }) {
  if (!groups.length) return <EmptyState title="No duplicates found" text="Duplicate URLs will appear here when your backlog needs cleanup." />
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.normalizedUrl} className="rounded-lg border border-rule bg-white/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h3 className="font-serif text-2xl">Duplicate URL</h3><p className="text-sm text-muted">{group.normalizedUrl}</p></div>
            <Button variant="primary" onClick={() => onMerge(group.links[0].id, group.links.slice(1).map((link) => link.id))}>Merge into oldest</Button>
          </div>
          <div className="space-y-2">{group.links.map((link) => <div key={link.id} className="flex items-center justify-between border-t border-rule py-3"><span>{link.title}</span><Button variant="danger" onClick={() => onDelete(link.id)}>Delete</Button></div>)}</div>
        </div>
      ))}
    </div>
  )
}

function SettingsPanel({ links, onMarkdown, onBackup }: { links: SavedLink[]; onMarkdown: () => void; onBackup: () => void }) {
  return (
    <div className="max-w-2xl rounded-lg border border-rule bg-white/60 p-6">
      <h2 className="font-serif text-4xl">Data and exports</h2>
      <p className="mt-3 text-muted">Your {links.length} saved links stay local. Export Markdown for reading lists or JSON for backups.</p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" icon="Download" onClick={onMarkdown}>Export Markdown</Button>
        <Button icon="Download" onClick={onBackup}>Export JSON backup</Button>
      </div>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-lg border border-dashed border-rule bg-white/40 p-12 text-center"><h2 className="font-serif text-4xl">{title}</h2><p className="mx-auto mt-3 max-w-md text-muted">{text}</p></div>
}
