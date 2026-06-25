/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, Hr, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  referrerName?: string
  personalMessage?: string
  referralCode: string
}

const ReferralInviteEmail = ({ referrerName, personalMessage, referralCode }: Props) => {
  const joinUrl = `${SITE_URL}/auth?tab=signup&ref=${encodeURIComponent(referralCode)}`
  return (
    <BrandLayout preview={referrerName ? `${referrerName} vous invite sur Casa Minga Séjours` : 'Une invitation Casa Minga Séjours vous attend'}>
      <Heading style={brand.h1}>
        {referrerName ? `${referrerName} vous invite` : 'Vous êtes invité·e'}
      </Heading>

      <Text style={brand.text}>
        {referrerName ? `${referrerName} pense à vous rejoindre sur ` : 'Bienvenue sur '}
        <strong>Casa Minga Séjours</strong>, la communauté d'échange entre habitats collectifs,
        écolieux et lieux de vie partagés.
      </Text>

      {personalMessage && (
        <Section style={quoteCard}>
          <Text style={quote}>« {personalMessage} »</Text>
        </Section>
      )}

      <Text style={brand.text}>
        En rejoignant via cette invitation, vous gagnez tous les deux un bonus de
        bienvenue pour faire vivre la communauté.
      </Text>

      <Button style={brand.button} href={joinUrl}>
        Rejoindre Casa Minga Séjours
      </Button>

      <Hr style={brand.hr} />
      <Text style={brand.textSmall}>
        Ou copiez ce lien&nbsp;: <Link href={joinUrl} style={brand.link}>{joinUrl}</Link>
      </Text>
    </BrandLayout>
  )
}

export const template = {
  component: ReferralInviteEmail,
  subject: (d: Record<string, any>) =>
    d?.referrerName
      ? `${d.referrerName} vous invite sur Casa Minga Séjours`
      : 'Une invitation Casa Minga Séjours vous attend',
  displayName: 'Invitation parrainage',
  previewData: {
    referrerName: 'Léa',
    personalMessage: 'Tu vas adorer cette communauté, viens découvrir !',
    referralCode: 'CM-a1b2c3d4',
  },
} satisfies TemplateEntry

const quote = { fontSize: '15px', color: brand.ink, lineHeight: '1.6', fontStyle: 'italic' as const, margin: 0 }
const quoteCard = { backgroundColor: brand.cream, borderRadius: '12px', padding: '16px 18px', margin: '6px 0 20px', borderLeft: `3px solid ${brand.terracotta}` }
