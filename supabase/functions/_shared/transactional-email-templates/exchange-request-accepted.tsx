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

const ExchangeRequestAcceptedEmail = ({
  guestName, hostName, listingTitle, placeName, startDate, endDate,
}: Props) => (
  <BrandLayout preview="Bonne nouvelle — votre échange est confirmé !">
    <Heading style={brand.h1}>Votre échange est confirmé 🌿</Heading>
    <Text style={brand.text}>
      {guestName ? `Bonjour ${guestName},` : 'Bonjour,'}{' '}
      <strong style={{ color: brand.ink }}>{hostName || 'L\'hôte'}</strong> a accepté votre
      demande de séjour. Préparez vos valises !
    </Text>

    <Section style={confirmCard}>
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

    <Text style={brand.text}>
      Continuez la conversation depuis votre tableau de bord pour organiser l'arrivée et
      partager vos attentes mutuelles.
    </Text>

    <Button style={brand.button} href={`${SITE_URL}/dashboard`}>Ouvrir la conversation</Button>

    <Text style={brand.textSmall}>
      Bon voyage, et belle rencontre 🤍
    </Text>
  </BrandLayout>
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

// Green-tinted card to signal a confirmed/positive state.
const confirmCard = { backgroundColor: '#f0f4ec', borderRadius: '12px', padding: '16px 18px', margin: '6px 0 20px' }
const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#7a8a6e', margin: '6px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 8px', lineHeight: '1.5' }
