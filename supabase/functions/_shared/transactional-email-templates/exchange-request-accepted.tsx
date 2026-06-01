/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  guestName?: string
  hostName?: string
  listingTitle?: string
  placeName?: string
  startDate?: string
  endDate?: string
}

const ExchangeRequestAcceptedEmail = ({
  guestName, hostName, listingTitle, placeName, startDate, endDate,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bonne nouvelle — votre échange est confirmé !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Votre échange est confirmé 🌿</Heading>
        <Text style={text}>
          {guestName ? `Bonjour ${guestName},` : 'Bonjour,'}{' '}
          <strong style={{ color: '#2e2623' }}>{hostName || 'L\'hôte'}</strong> a accepté votre
          demande de séjour. Préparez vos valises !
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>Séjour confirmé</Text>
          <Text style={cardValue}>
            {listingTitle || 'Séjour'}{placeName ? ` — ${placeName}` : ''}
          </Text>
          {(startDate || endDate) && (
            <>
              <Text style={cardLabel}>Dates</Text>
              <Text style={cardValue}>{startDate} → {endDate}</Text>
            </>
          )}
        </Section>

        <Text style={text}>
          Continuez la conversation depuis votre tableau de bord pour organiser l'arrivée et
          partager vos attentes mutuelles.
        </Text>

        <Button style={button} href={`${SITE_URL}/dashboard`}>Ouvrir la conversation</Button>

        <Text style={footer}>
          Bon voyage, et belle rencontre 🤍<br />
          {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ExchangeRequestAcceptedEmail,
  subject: 'Votre échange est confirmé !',
  displayName: 'Demande acceptée — notification au demandeur',
  previewData: {
    guestName: 'Camille',
    hostName: 'Léa',
    listingTitle: 'Chambre dans la maison commune',
    placeName: 'Écohameau du Plessis',
    startDate: '15 mai 2026',
    endDate: '22 mai 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px', fontWeight: 'bold' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: '#2e2623', margin: '0 0 18px',
}
const text = { fontSize: '14px', color: '#81746e', lineHeight: '1.6', margin: '0 0 22px' }
const card = { backgroundColor: '#f0f4ec', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
const cardLabel = {
  fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px',
  color: '#7a8a6e', margin: '6px 0 2px', fontWeight: '600' as const,
}
const cardValue = { fontSize: '14px', color: '#2e2623', margin: '0 0 8px', lineHeight: '1.5' }
const button = {
  backgroundColor: '#d4623b', color: '#ffffff', fontSize: '14px',
  fontWeight: '500' as const, borderRadius: '8px',
  padding: '12px 22px', textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.6' }
