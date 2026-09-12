/**
 * Extensible Format Registry following the Open/Closed Principle (OCP).
 * New formats and their design tokens can be added here without modifying application logic.
 */

import { EventCategory } from '../types/event';

export interface FormatDefinition {
  id: EventCategory;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  themeClass: string;
  badgeLabel: string;
}

export const FORMAT_REGISTRY: Record<EventCategory, FormatDefinition> = {
  'grounds-for-thought': {
    id: 'grounds-for-thought',
    name: 'Grounds for Thought',
    subtitle: 'Café Conversations',
    description: 'Casual, salon-style discussions held in independent cafés and informal third spaces across the city.',
    accentColor: '#C26540',
    themeClass: 'formatTerracotta',
    badgeLabel: 'Grounds for Thought',
  },
  'unlecture': {
    id: 'unlecture',
    name: 'unLecture',
    subtitle: 'Intimate Flagship Lectures',
    description: 'De-pedestalised, deep-dive talks by thinkers, practitioners, and scholars in unconventional settings.',
    accentColor: '#6B7A5A',
    themeClass: 'formatSage',
    badgeLabel: 'unLecture',
  },
  'community': {
    id: 'community',
    name: 'Community Events',
    subtitle: 'Workshops & Meetups',
    description: 'Participatory workshops, reading circles, and community-led gatherings that make ideas speakable again.',
    accentColor: '#B88585',
    themeClass: 'formatDustyRose',
    badgeLabel: 'Community',
  },
  'unlecture-series': {
    id: 'unlecture-series',
    name: 'unLecture Series',
    subtitle: 'Curated Masterclasses',
    description: 'Multi-session explorations into singular subjects — philosophy, architecture, literature, and art history.',
    accentColor: '#5A5A3C',
    themeClass: 'formatOlive',
    badgeLabel: 'Series',
  },
};

export const ALL_FORMATS = Object.values(FORMAT_REGISTRY);

export function getFormatDefinition(category: string): FormatDefinition | undefined {
  return FORMAT_REGISTRY[category as EventCategory];
}
