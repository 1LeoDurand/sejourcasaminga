/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Img, Link, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, Hr, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

interface Habitat {
  id: string
  name: string
  region?: string
  type?: string
  image?: string
  matchPct?: number
  slug?: string
}
interface Availability {
  habitat: string
  region?: string
  dates: string
  url: string
}
interface Article {
  title: string
  excerpt: string
  url: string
}
interface Event {
  title: string
  habitat: string
  date: string
  url: string
}
interface Props {
  firstName?: string
  habitats?: Habitat[]
  availabilities?: Availability[]
  articles?: Article[]
  events?: Event[]
  preferencesUrl?: string
  unsubscribeUrl?: string
}

const WeeklyDigest = ({
  firstName,
  habitats = [],
  availabilities = [],
  articles = [],
  events = [],
  preferencesUrl = `${SITE_URL}/edit-profile`,
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
}: Props) => (
  <BrandLayout
    preview="Découvre des habitats et articles sélectionnés pour toi cette semaine 🌿"
    preferencesUrl={preferencesUrl}
    unsubscribeUrl={unsubscribeUrl}
  >
    <Heading style={brand.h1}>
      Bonjour {firstName || 'à toi'} 👋
    </Heading>
    <Text style={brand.text}>
      Voici une sélection d'habitats, dates et inspirations alignées avec ce que tu cherches.
    </Text>

    {habitats.length > 0 && (
      <>
        <Heading as="h2" style={brand.h2}>Habitats alignés cette semaine</Heading>
        {habitats.map((h) => (
          <Section key={h.id} style={brand.card}>
            {h.image && (
              <Img src={h.image} alt={h.name} width="520" height="220" style={cardImg} />
            )}
            <Text style={cardTitle}>{h.name}</Text>
            <Text style={cardMeta}>
              {[h.type, h.region].filter(Boolean).join(' · ')}
            </Text>
            {typeof h.matchPct === 'number' && (
              <Text style={match}>✨ Matche {h.matchPct}% de tes valeurs</Text>
            )}
            <Button style={brand.button} href={`${SITE_URL}/habitat/${h.slug || h.id}`}>
              Découvrir
            </Button>
          </Section>
        ))}
      </>
    )}

    {availabilities.length > 0 && (
      <>
        <Hr style={brand.hr} />
        <Heading as="h2" style={brand.h2}>Nouvelles dates disponibles</Heading>
        {availabilities.map((a, i) => (
          <Text key={i} style={listItem}>
            📅 <Link href={a.url} style={brand.link}>{a.habitat}</Link>
            {a.region ? ` · ${a.region}` : ''} — {a.dates}
          </Text>
        ))}
      </>
    )}

    {articles.length > 0 && (
      <>
        <Hr style={brand.hr} />
        <Heading as="h2" style={brand.h2}>Actualités Casa Minga</Heading>
        {articles.map((a, i) => (
          <Section key={i} style={articleCard}>
            <Text style={cardTitle}>{a.title}</Text>
            <Text style={brand.textSmall}>{a.excerpt}</Text>
            <Link href={a.url} style={brand.link}>Lire l'article →</Link>
          </Section>
        ))}
      </>
    )}

    {events.length > 0 && (
      <>
        <Hr style={brand.hr} />
        <Heading as="h2" style={brand.h2}>À venir près de chez toi</Heading>
        {events.map((e, i) => (
          <Text key={i} style={listItem}>
            🌱 <strong>{e.title}</strong> · {e.habitat} — {e.date}{' '}
            <Link href={e.url} style={brand.link}>M'intéresser</Link>
          </Text>
        ))}
      </>
    )}
  </BrandLayout>
)

export const template = {
  component: WeeklyDigest,
  subject: '🌿 Lieux alignés avec toi cette semaine',
  displayName: 'Digest hebdomadaire',
  previewData: {
    firstName: 'Léa',
    habitats: [
      { id: '1', slug: 'le-mas-des-oliviers', name: 'Le Mas des Oliviers', region: 'Drôme', type: 'Écolieu', matchPct: 92, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=520&h=220&fit=crop' },
      { id: '2', slug: 'coliving-aurore', name: 'Coliving Aurore', region: 'Ariège', type: 'Coliving', matchPct: 84 },
    ],
    availabilities: [
      { habitat: 'La Bergerie Partagée', region: 'Cévennes', dates: '12 → 19 juin', url: SITE_URL },
    ],
    articles: [
      { title: 'Vivre en collectif sans s\'épuiser', excerpt: 'Cinq rituels simples pour préserver son énergie en habitat partagé.', url: SITE_URL + '/blog' },
    ],
    events: [
      { title: 'Atelier jardinage en permaculture', habitat: 'Le Mas des Oliviers', date: 'Sam. 15 juin', url: SITE_URL },
    ],
  },
} satisfies TemplateEntry

const cardImg = { borderRadius: '8px', objectFit: 'cover' as const, width: '100%', height: 'auto', margin: '0 0 10px' }
const cardTitle = { fontSize: '15px', fontWeight: '600' as const, color: brand.ink, margin: '0 0 4px' }
const cardMeta = { fontSize: '13px', color: brand.muted, margin: '0 0 6px' }
const match = { fontSize: '13px', color: brand.terracotta, margin: '0 0 10px', fontWeight: '500' as const }
const articleCard = { padding: '6px 0 10px' }
const listItem = { fontSize: '14px', color: brand.ink, margin: '0 0 10px', lineHeight: '1.55' }
