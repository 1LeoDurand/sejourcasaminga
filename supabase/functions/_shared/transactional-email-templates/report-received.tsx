/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Heading, Link, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, brand } from './BrandLayout.tsx'

const SITE_NAME = 'Casa Minga Séjours'
const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  targetType?: string
  targetId?: string
  reason?: string
  details?: string
  reporterName?: string
  submittedAt?: string
}

const labelForReason = (r?: string) => {
  switch (r) {
    case 'fake_listing': return 'Annonce fausse ou trompeuse'
    case 'misleading_info': return 'Informations incorrectes'
    case 'inappropriate_content': return 'Contenu inapproprié'
    case 'harassment': return 'Harcèlement ou comportement abusif'
    case 'spam': return 'Spam ou publicité'
    default: return 'Autre raison'
  }
}

const labelForTarget = (t?: string) => {
  switch (t) {
    case 'listing': return 'un séjour'
    case 'place': return 'un lieu'
    case 'profile': return 'un profil'
    case 'review': return 'un avis'
    default: return 'un élément'
  }
}

const ReportReceivedEmail = ({ targetType, targetId, reason, details, reporterName, submittedAt }: Props) => (
  <BrandLayout preview={`🚩 Nouveau signalement — ${SITE_NAME}`}>
    <Heading style={brand.h1}>🚩 Nouveau signalement</Heading>
    <Text style={brand.text}>
      Un membre vient de signaler {labelForTarget(targetType)} sur {SITE_NAME}.
    </Text>

    <Section style={brand.card}>
      <Text style={cardLabel}>Motif</Text>
      <Text style={cardValue}>{labelForReason(reason)}</Text>

      {details && (
        <>
          <Text style={cardLabel}>Détails</Text>
          <Text style={cardQuote}>« {details} »</Text>
        </>
      )}

      <Text style={cardLabel}>Cible</Text>
      <Text style={cardValueSmall}>{labelForTarget(targetType)} · {targetId || '—'}</Text>

      {reporterName && (
        <>
          <Text style={cardLabel}>Signalé par</Text>
          <Text style={cardValue}>{reporterName}</Text>
        </>
      )}
      {submittedAt && (
        <>
          <Text style={cardLabel}>Le</Text>
          <Text style={cardValue}>{submittedAt}</Text>
        </>
      )}
    </Section>

    <Text style={brand.text}>
      <Link href={`${SITE_URL}/admin/reports`} style={brand.link}>Voir dans l'espace de modération →</Link>
    </Text>

    <Text style={brand.textSmall}>{SITE_NAME} — modération</Text>
  </BrandLayout>
)

export const template = {
  component: ReportReceivedEmail,
  subject: (d: any) => `🚩 Signalement (${labelForReason(d?.reason)}) — ${SITE_NAME}`,
  displayName: 'Signalement reçu (admin)',
  previewData: {
    targetType: 'listing',
    targetId: 'd2000000-0000-4000-8000-000000000002',
    reason: 'inappropriate_content',
    details: 'Les photos ne correspondent pas au lieu décrit.',
    reporterName: 'Awa Diop',
    submittedAt: '5 juin 2026, 14:32',
  },
} satisfies TemplateEntry

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '12px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 4px', lineHeight: '1.5' }
const cardValueSmall = { fontSize: '12px', color: brand.body, margin: '0 0 4px', lineHeight: '1.4', wordBreak: 'break-all' as const }
const cardQuote = { fontSize: '14px', color: brand.ink, fontStyle: 'italic' as const, margin: '0 0 8px', lineHeight: '1.6' }
