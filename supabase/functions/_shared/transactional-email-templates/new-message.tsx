/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  recipientName?: string
  senderName?: string
  messagePreview?: string
  conversationId?: string
  listingTitle?: string
}

const NewMessageEmail = ({
  recipientName, senderName, messagePreview, conversationId, listingTitle,
}: Props) => (
  <BrandLayout preview={`Nouveau message${senderName ? ` de ${senderName}` : ''} sur Casa Minga Séjours`}>
    <Heading style={brand.h1}>Vous avez un nouveau message ✉️</Heading>
    <Text style={brand.text}>
      {recipientName ? `Bonjour ${recipientName},` : 'Bonjour,'}{' '}
      <strong style={{ color: brand.ink }}>{senderName || 'Un membre'}</strong> vous a envoyé
      un message{listingTitle ? ` à propos de « ${listingTitle} »` : ''}.
    </Text>

    {messagePreview && (
      <Section style={brand.card}>
        <Text style={cardLabel}>Aperçu du message</Text>
        <Text style={cardQuote}>« {messagePreview} »</Text>
      </Section>
    )}

    <Button
      style={brand.button}
      href={conversationId
        ? `${SITE_URL}/dashboard/conversations/${conversationId}`
        : `${SITE_URL}/dashboard`}
    >
      Lire et répondre
    </Button>

    <Text style={brand.textSmall}>
      Une conversation humaine fait toute la différence.
    </Text>
  </BrandLayout>
)

export const template = {
  component: NewMessageEmail,
  subject: (d: any) => `Nouveau message${d?.senderName ? ` de ${d.senderName}` : ''} sur Casa Minga Séjours`,
  displayName: 'Nouveau message — notification au destinataire',
  previewData: {
    recipientName: 'Léa',
    senderName: 'Camille',
    messagePreview: 'Bonjour ! Nous serions ravis d\'en savoir plus sur votre lieu.',
    conversationId: 'abc-123',
    listingTitle: 'Chambre dans la maison commune',
  },
} satisfies TemplateEntry

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '6px 0 8px', fontWeight: '600' as const }
const cardQuote = { fontSize: '14px', color: brand.ink, fontStyle: 'italic' as const, margin: '0', lineHeight: '1.6' }
