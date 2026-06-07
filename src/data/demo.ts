import { createSavedLink } from '../domain/links'
import type { SavedLink } from '../domain/types'

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000)

export function demoLinks(): SavedLink[] {
  return [
    createSavedLink({ title: 'Building trust in AI products', url: 'https://nesslabs.com/trust-ai-products', note: 'Great points on transparency and model uncertainty.', tags: ['ai', 'design'], savedAt: daysAgo(2).toISOString() }),
    createSavedLink({ title: 'Why long-term thinking wins', url: 'https://stratechery.com/2026/long-term-thinking', note: 'Framework for compounding technology bets.', tags: ['strategy'], savedAt: daysAgo(5).toISOString() }),
    createSavedLink({ title: 'The case for local-first software', url: 'https://martinfowler.com/articles/local-first.html', note: 'Local-first principles and practical examples.', tags: ['architecture', 'offline'], status: 'reading', savedAt: daysAgo(8).toISOString() }),
    createSavedLink({ title: 'A designers guide to information scent', url: 'https://fabricsofthinking.com/information-scent', note: 'Clear heuristics for better navigation.', tags: ['ux'], savedAt: daysAgo(15).toISOString() }),
    createSavedLink({ title: 'Ship small, learn fast', url: 'https://a16z.com/ship-small-learn-fast', note: 'Notes from the essay on iteration velocity.', tags: ['product', 'growth'], status: 'done', savedAt: daysAgo(18).toISOString() }),
    createSavedLink({ title: 'Improving developer experience', url: 'https://developer.chrome.com/blog/devex-metrics', note: 'DX metrics and practical improvements.', tags: ['devex', 'tools'], savedAt: daysAgo(21).toISOString() }),
    createSavedLink({ title: "The best technical writing I've read", url: 'https://news.ycombinator.com/item?id=41800123', note: 'A curated thread of great resources.', tags: ['writing'], status: 'archived', savedAt: daysAgo(33).toISOString() }),
    createSavedLink({ title: 'Building trust in AI products', url: 'https://www.nesslabs.com/trust-ai-products#comments', note: 'Duplicate with notes from comments.', tags: ['ai'], savedAt: daysAgo(41).toISOString() }),
  ]
}

