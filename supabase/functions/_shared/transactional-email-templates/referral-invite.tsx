/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  referrerName?: string
  personalMessage?: string
  referralCode: string
}

const ReferralInviteEmail = ({ referrerName, personalMessage, referralCode }: Props) => {
  const joinUrl = `${SITE_URL}/auth?tab=signup&ref=${encodeURIComponent(referralCode)}`
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>{referrerName ? `${referrerName} vous invite sur Casa Minga` : 'Une invitation Casa Minga vous attend'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {referrerName ? `${referrerName} vous invite` : 'Vous êtes invité·e'}
          </Heading>

          <Text style={text}>
            {referrerName ? `${referrerName} pense à vous rejoindre sur ` : 'Bienvenue sur '}
            <strong>Casa Minga</strong>, la communauté d'échange entre habitats collectifs,
            écolieux et lieux de vie partagés.
          </Text>

          {personalMessage && (
            <Section style={card}>
              <Text style={quote}>« {personalMessage} »</Text>
            </Section>
          )}

          <Text style={text}>
            En rejoignant via cette invitation, vous gagnez tous les deux un bonus de
            bienvenue pour faire vivre la communauté.
          </Text>

          <Button style={button} href={joinUrl}>
            Rejoindre Casa Minga
          </Button>

          <Hr style={hr} />
          <Text style={textSmall}>
            Ou copiez ce lien&nbsp;: <Link href={joinUrl} style={link}>{joinUrl}</Link>
          </Text>
          <Text style={footer}>
            {SITE_NAME} — <Link href={SITE_URL} style={link}>casaminga.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ReferralInviteEmail,
  subject: (d: Record<string, any>) =>
    d?.referrerName
      ? `${d.referrerName} vous invite sur Casa Minga`
      : 'Une invitation Casa Minga vous attend',
  displayName: 'Invitation parrainage',
  previewData: {
    referrerName: 'Léa',
    personalMessage: 'Tu vas adorer cette communauté, viens découvrir !',
    referralCode: 'CM-a1b2c3d4',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '26px', fontWeight: 'bold' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: '#2e2623', margin: '0 0 18px',
}
const text = { fontSize: '15px', color: '#5e524d', lineHeight: '1.65', margin: '0 0 18px' }
const textSmall = { fontSize: '13px', color: '#81746e', lineHeight: '1.6', margin: '0 0 14px' }
const quote = { fontSize: '15px', color: '#2e2623', lineHeight: '1.6', fontStyle: 'italic' as const, margin: 0 }
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '18px 20px', margin: '6px 0 24px', borderLeft: '3px solid #D65D39' }
const button = {
  backgroundColor: '#D65D39', color: '#ffffff', fontSize: '15px',
  fontWeight: '500' as const, borderRadius: '999px',
  padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#eee5df', margin: '28px 0 20px' }
const link = { color: '#D65D39', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#a89890', margin: '14px 0 0' }
