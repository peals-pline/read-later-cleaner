import { describe, expect, it } from 'vitest'
import { createSavedLink, exportBackupJSON, exportLinksMarkdown, filterLinks, findDuplicateGroups, getReviewQueue, parseBackupJSON } from './links'

const now = new Date('2026-06-07T12:00:00.000Z')

describe('link domain logic', () => {
  it('normalizes tags, urls and searchable fields', () => {
    const link = createSavedLink({ title: 'Local-first writing', url: 'https://www.example.com/post/?b=2&a=1#note', tags: ['UX', '#ux', ' reading '] }, now)
    expect(link.domain).toBe('example.com')
    expect(link.tags).toEqual(['ux', 'reading'])
    expect(link.normalizedUrl).toBe('https://example.com/post?a=1&b=2')
    expect(filterLinks([link], { query: 'reading' })).toHaveLength(1)
  })

  it('finds duplicate urls and builds an old unread review queue', () => {
    const a = createSavedLink({ title: 'One', url: 'https://example.com/a', savedAt: '2026-05-01T00:00:00.000Z' }, now)
    const b = createSavedLink({ title: 'Two', url: 'https://www.example.com/a#section', savedAt: '2026-05-02T00:00:00.000Z' }, now)
    const c = createSavedLink({ title: 'Three', url: 'https://example.com/c', status: 'done', savedAt: '2026-04-01T00:00:00.000Z' }, now)
    expect(findDuplicateGroups([a, b, c])).toHaveLength(1)
    expect(getReviewQueue([b, a, c], 1)[0].title).toBe('One')
  })

  it('exports markdown and backup json that can be imported again', () => {
    const link = createSavedLink({ title: 'Export me', url: 'https://example.com/export', note: 'Useful', tags: ['tools'] }, now)
    expect(exportLinksMarkdown([link])).toContain('[Export me](https://example.com/export)')
    const parsed = parseBackupJSON(exportBackupJSON([link], now))
    expect(parsed[0].title).toBe('Export me')
  })
})

