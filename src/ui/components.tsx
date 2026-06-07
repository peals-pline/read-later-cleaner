import type { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import type { LinkStatus, SavedLink } from '../domain/types'
import { ageLabel } from '../domain/links'
import { Icon, type IconName } from './icons'

export function Button({ children, variant = 'secondary', className, icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: IconName }) {
  return (
    <button
      {...props}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ember/30 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'border-ember bg-ember text-white shadow-[0_8px_22px_rgba(223,47,20,.18)] hover:bg-emberDark',
        variant === 'secondary' && 'border-rule bg-white/70 text-ink hover:border-[#d4c8ba] hover:bg-white',
        variant === 'ghost' && 'border-transparent bg-transparent text-muted hover:bg-[#f4ece2] hover:text-ink',
        variant === 'danger' && 'border-[#f2c6bb] bg-[#fff4f1] text-ember hover:bg-[#ffe8e1]',
        className)}
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function StatusPill({ status }: { status: LinkStatus }) {
  const styles = {
    unread: 'bg-[#ffe6df] text-ember',
    reading: 'bg-[#e7f0ff] text-[#2e66b6]',
    done: 'bg-[#e3f2df] text-[#47753c]',
    archived: 'bg-[#ece8e1] text-muted',
  }
  return <span className={clsx('rounded-full px-3 py-1 text-xs font-medium capitalize', styles[status])}>{status}</span>
}

export function Tag({ children }: { children: string }) {
  return <span className="rounded-md bg-[#eee6db] px-2 py-1 text-xs text-muted">{children}</span>
}

export function LinkRow({ link, selected, onSelect, onStatus, onDelete }: { link: SavedLink; selected?: boolean; onSelect?: () => void; onStatus?: (status: LinkStatus) => void; onDelete?: () => void }) {
  return (
    <div className={clsx('grid grid-cols-[34px_1.45fr_.78fr_70px_.82fr_1fr_88px_26px] items-center gap-4 border-b border-rule px-2 py-4 text-sm', selected && 'bg-[#fff7f2]')}>
      <button className="grid h-4 w-4 place-items-center rounded border border-[#cfc5ba]" aria-label="Select link" onClick={onSelect} />
      <div>
        <div className="font-semibold leading-snug text-ink">{link.title}</div>
        <a className="mt-1 block truncate text-xs text-muted hover:text-ember" href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
      </div>
      <div className="text-sm text-muted">{link.domain}</div>
      <div className="text-sm text-muted">{ageLabel(link.savedAt)}</div>
      <div className="flex flex-wrap gap-1.5">{link.tags.slice(0, 2).map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
      <div className="line-clamp-2 text-sm leading-snug text-muted">{link.note || 'No note yet.'}</div>
      <div className="flex items-center gap-1">
        <StatusPill status={link.status} />
        <select className="w-4 appearance-none bg-transparent text-transparent" aria-label={`Change status for ${link.title}`} value={link.status} onChange={(event) => onStatus?.(event.target.value as LinkStatus)}>
          <option value="unread">Unread</option>
          <option value="reading">Reading</option>
          <option value="done">Done</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <button aria-label={`Delete ${link.title}`} className="text-muted hover:text-ember" onClick={onDelete}><Icon name="Trash2" /></button>
    </div>
  )
}
