/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

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
  <BrandLayout preview={`Nouvelle demande d'échange${guestName ? ` de ${guestName}` : ''}`}>
    <Heading style={brand.h1}>Nouvelle demande d'échange</Heading>
    <Text style={brand.text}>
      {hostName ? `Bonjour ${hostName},` : 'Bonjour,'}{' '}
      <strong style={{ color: brand.ink }}>{guestName || 'Un membre'}</strong> souhaite séjourner
      chez vous{listingTitle ? ` pour « ${listingTitle} »` : ''}.
    </Text>

    <Section style={brand.card}>
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

    <Button style={brand.button} href={`${SITE_URL}/dashboard`}>Répondre à la demande</Button>

    <Text style={brand.textSmall}>
      Prenez le temps de répondre — un échange humain commence par un mot personnel.
    </Text>
  </BrandLayout>
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

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '6px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 8px', lineHeight: '1.5' }
const cardQuote = { fontSize: '13px', color: brand.body, fontStyle: 'italic' as const, margin: '0 0 4px', lineHeight: '1.6' }
