import {
  Archive, Bookmark, Check, ChevronDown, Clock, Copy, Download, ExternalLink, FileText,
  Inbox, Library, MoreHorizontal, PanelRightOpen, Search, Settings, ShieldCheck, SlidersHorizontal,
  Square, Star, Trash2, Upload, X,
} from 'lucide-react'

const icons = {
  Archive, Bookmark, Check, ChevronDown, Clock, Copy, Download, ExternalLink, FileText,
  Inbox, Library, MoreHorizontal, PanelRightOpen, Search, Settings, ShieldCheck, SlidersHorizontal,
  Square, Star, Trash2, Upload, X,
}

export type IconName = keyof typeof icons

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = icons[name]
  return <Component className={className ?? 'h-4 w-4'} strokeWidth={1.8} />
}
