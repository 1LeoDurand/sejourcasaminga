/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  hostName?: string
  guestName?: string
  listingTitle?: string
  placeName?: string
  startDate?: string
  endDate?: string
  guests?: number
  message?: string
}

const ExchangeRequestReceivedEmail = ({
  hostName, guestName, listingTitle, placeName, startDate, endDate, guests, message,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle demande d'échange{guestName ? ` de ${guestName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouvelle demande d'échange</Heading>
        <Text style={text}>
          {hostName ? `Bonjour ${hostName},` : 'Bonjour,'}{' '}
          <strong style={{ color: '#2e2623' }}>{guestName || 'Un membre'}</strong> souhaite séjourner
          chez vous{listingTitle ? ` pour « ${listingTitle} »` : ''}.
        </Text>

        <Section style={card}>
          {placeName && (
            <>
              <Text style={cardLabel}>Lieu</Text>
              <Text style={cardValue}>{placeName}</Text>
            </>
          )}
          {(startDate || endDate) && (
            <>
              <Text style={cardLabel}>Dates demandées</Text>
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
              <Text style={cardLabel}>Message</Text>
              <Text style={cardQuote}>« {message} »</Text>
            </>
          )}
        </Section>

        <Button style={button} href={`${SITE_URL}/dashboard`}>Répondre à la demande</Button>

        <Text style={footer}>
          Prenez le temps de répondre — un échange humain commence par un mot personnel.
          <br />
          {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ExchangeRequestReceivedEmail,
  subject: (d: any) => `Nouvelle demande d'échange${d?.guestName ? ` de ${d.guestName}` : ''}`,
  displayName: 'Nouvelle demande — notification à l\'hôte',
  previewData: {
    hostName: 'Léa',
    guestName: 'Camille',
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
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
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
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.6' }
