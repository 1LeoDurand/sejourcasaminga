/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://casaminga.com'

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
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Découvre des habitats et articles sélectionnés pour toi cette semaine 🌿</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Bonjour {firstName || 'à toi'} 👋
        </Heading>
        <Text style={text}>
          Voici une sélection d'habitats, dates et inspirations alignées avec ce que tu cherches.
        </Text>

        {habitats.length > 0 && (
          <>
            <Heading as="h2" style={h2}>Habitats alignés cette semaine</Heading>
            {habitats.map((h) => (
              <Section key={h.id} style={card}>
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
                <Button style={button} href={`${SITE_URL}/habitat/${h.slug || h.id}`}>
                  Découvrir
                </Button>
              </Section>
            ))}
          </>
        )}

        {availabilities.length > 0 && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>Nouvelles dates disponibles</Heading>
            {availabilities.map((a, i) => (
              <Text key={i} style={listItem}>
                📅 <Link href={a.url} style={link}>{a.habitat}</Link>
                {a.region ? ` · ${a.region}` : ''} — {a.dates}
              </Text>
            ))}
          </>
        )}

        {articles.length > 0 && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>Actualités Casa Minga</Heading>
            {articles.map((a, i) => (
              <Section key={i} style={articleCard}>
                <Text style={cardTitle}>{a.title}</Text>
                <Text style={textSmall}>{a.excerpt}</Text>
                <Link href={a.url} style={link}>Lire l'article →</Link>
              </Section>
            ))}
          </>
        )}

        {events.length > 0 && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>À venir près de chez toi</Heading>
            {events.map((e, i) => (
              <Text key={i} style={listItem}>
                🌱 <strong>{e.title}</strong> · {e.habitat} — {e.date}{' '}
                <Link href={e.url} style={link}>M'intéresser</Link>
              </Text>
            ))}
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          <Link href={preferencesUrl} style={footerLink}>Personnaliser la fréquence</Link>
          {'  ·  '}
          <Link href={unsubscribeUrl} style={footerLink}>Se désabonner</Link>
        </Text>
        <Text style={footer}>
          Casa Minga — <Link href={SITE_URL} style={link}>casaminga.com</Link>
        </Text>
      </Container>
    </Body>
  </Html>
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

const main = { backgroundColor: '#fbf7f4', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 25px', maxWidth: '560px', backgroundColor: '#ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, fontFamily: "'Playfair Display', Georgia, serif", color: '#2e2623', margin: '0 0 14px' }
const h2 = { fontSize: '17px', fontWeight: '600' as const, fontFamily: "'Playfair Display', Georgia, serif", color: '#2e2623', margin: '22px 0 12px' }
const text = { fontSize: '15px', color: '#5e524d', lineHeight: '1.65', margin: '0 0 14px' }
const textSmall = { fontSize: '13px', color: '#81746e', lineHeight: '1.6', margin: '4px 0 8px' }
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '14px 16px', margin: '0 0 14px' }
const articleCard = { padding: '6px 0 10px' }
const cardImg = { borderRadius: '8px', objectFit: 'cover' as const, width: '100%', height: 'auto', margin: '0 0 10px' }
const cardTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#2e2623', margin: '0 0 4px' }
const cardMeta = { fontSize: '13px', color: '#81746e', margin: '0 0 6px' }
const match = { fontSize: '13px', color: '#D65D39', margin: '0 0 10px', fontWeight: '500' as const }
const button = { backgroundColor: '#D65D39', color: '#ffffff', fontSize: '14px', fontWeight: '500' as const, borderRadius: '999px', padding: '10px 22px', textDecoration: 'none', display: 'inline-block' }
const listItem = { fontSize: '14px', color: '#2e2623', margin: '0 0 10px', lineHeight: '1.55' }
const hr = { borderColor: '#eee5df', margin: '24px 0 10px' }
const link = { color: '#D65D39', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#a09289', textAlign: 'center' as const, margin: '12px 0 0' }
const footerLink = { color: '#a09289', textDecoration: 'underline' }
