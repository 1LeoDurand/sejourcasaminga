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
  guests?: number
  message?: string
}

const ExchangeRequestSentEmail = ({
  guestName, hostName, listingTitle, placeName, startDate, endDate, guests, message,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre demande d'échange a bien été envoyée</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Votre demande est partie ✨</Heading>
        <Text style={text}>
          {guestName ? `Bonjour ${guestName},` : 'Bonjour,'} votre demande d'échange a bien été
          transmise{hostName ? ` à ${hostName}` : ''}. Vous serez notifié·e dès qu'une réponse arrive.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>Séjour</Text>
          <Text style={cardValue}>
            {listingTitle || 'Séjour'}{placeName ? ` — ${placeName}` : ''}
          </Text>
          {(startDate || endDate) && (
            <>
              <Text style={cardLabel}>Dates</Text>
              <Text style={cardValue}>{startDate} → {endDate}</Text>
            </>
          )}
          {guests && (
            <>
              <Text style={cardLabel}>Voyageurs</Text>
              <Text style={cardValue}>{guests}</Text>
            </>
          )}
          {message && (
            <>
              <Text style={cardLabel}>Votre message</Text>
              <Text style={cardQuote}>« {message} »</Text>
            </>
          )}
        </Section>

        <Button style={button} href={`${SITE_URL}/dashboard`}>Voir mes échanges</Button>

        <Text style={footer}>
          {SITE_NAME} — l'échange entre habitats collectifs.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ExchangeRequestSentEmail,
  subject: 'Votre demande d\'échange a bien été envoyée',
  displayName: 'Demande envoyée — confirmation au demandeur',
  previewData: {
    guestName: 'Camille',
    hostName: 'Léa',
    listingTitle: 'Chambre dans la maison commune',
    placeName: 'Écohameau du Plessis',
    startDate: '15 mai 2026',
    endDate: '22 mai 2026',
    guests: 2,
    message: 'Bonjour, nous serions ravis de découvrir votre lieu en famille.',
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
const card = {
  backgroundColor: '#fbf7f4', borderRadius: '12px',
  padding: '18px 20px', margin: '0 0 24px',
}
const cardLabel = {
  fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px',
  color: '#a89890', margin: '6px 0 2px', fontWeight: '600' as const,
}
const cardValue = { fontSize: '14px', color: '#2e2623', margin: '0 0 8px', lineHeight: '1.5' }
const cardQuote = { fontSize: '13px', color: '#5e524d', fontStyle: 'italic' as const, margin: '0 0 4px', lineHeight: '1.6' }
const button = {
  backgroundColor: '#d4623b', color: '#ffffff', fontSize: '14px',
  fontWeight: '500' as const, borderRadius: '8px',
  padding: '12px 22px', textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
