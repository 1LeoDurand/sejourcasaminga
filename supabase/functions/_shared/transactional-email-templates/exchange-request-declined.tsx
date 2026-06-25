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
}

const ExchangeRequestDeclinedEmail = ({
  guestName, hostName, listingTitle, placeName, startDate, endDate,
}: Props) => (
  <BrandLayout preview="Réponse à votre demande d'échange">
    <Heading style={brand.h1}>Réponse à votre demande</Heading>
    <Text style={brand.text}>
      {guestName ? `Bonjour ${guestName},` : 'Bonjour,'}{' '}
      <strong style={{ color: brand.ink }}>{hostName || 'L\'hôte'}</strong> n'a malheureusement
      pas pu accueillir votre demande pour ces dates.
    </Text>

    <Section style={brand.card}>
      <Text style={cardLabel}>Demande</Text>
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

    <Text style={brand.text}>
      Ne vous découragez pas — d'autres lieux collectifs vous attendent. Explorez la carte et
      envoyez une nouvelle demande quand vous voulez.
    </Text>

    <Button style={brand.button} href={`${SITE_URL}/discover`}>Découvrir d'autres lieux</Button>

    <Text style={brand.textSmall}>À bientôt sur Casa Minga Séjours.</Text>
  </BrandLayout>
)

export const template = {
  component: ExchangeRequestDeclinedEmail,
  subject: 'Réponse à votre demande d\'échange',
  displayName: 'Demande déclinée — notification au demandeur',
  previewData: {
    guestName: 'Camille',
    hostName: 'Léa',
    listingTitle: 'Chambre dans la maison commune',
    placeName: 'Écohameau du Plessis',
    startDate: '15 mai 2026',
    endDate: '22 mai 2026',
  },
} satisfies TemplateEntry

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '6px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 8px', lineHeight: '1.5' }
