/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

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
  <BrandLayout preview="Votre demande d'échange a bien été envoyée">
    <Heading style={brand.h1}>Votre demande est partie ✨</Heading>
    <Text style={brand.text}>
      {guestName ? `Bonjour ${guestName},` : 'Bonjour,'} votre demande d'échange a bien été
      transmise{hostName ? ` à ${hostName}` : ''}. Vous serez notifié·e dès qu'une réponse arrive.
    </Text>

    <Section style={brand.card}>
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

    <Button style={brand.button} href={`${SITE_URL}/dashboard`}>Voir mes échanges</Button>
  </BrandLayout>
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

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '6px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 8px', lineHeight: '1.5' }
const cardQuote = { fontSize: '13px', color: brand.body, fontStyle: 'italic' as const, margin: '0 0 4px', lineHeight: '1.6' }
