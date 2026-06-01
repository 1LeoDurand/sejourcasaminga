/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  fullName?: string
  placeName?: string
  verifyUrl?: string
  expiresInDays?: number
}

const ClaimVerificationEmail = ({ fullName, placeName, verifyUrl, expiresInDays = 7 }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre demande de revendication sur {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {fullName ? `Bonjour ${fullName},` : 'Bonjour,'}
        </Heading>

        <Text style={text}>
          Nous avons reçu votre demande de revendication pour le lieu{' '}
          <strong>{placeName || 'concerné'}</strong> sur {SITE_NAME}.
        </Text>

        <Text style={text}>
          Pour confirmer que cette adresse email vous appartient bien, cliquez
          sur le bouton ci-dessous. Notre équipe examinera ensuite votre
          demande avant de vous donner accès à la gestion de la fiche.
        </Text>

        <Button style={button} href={verifyUrl || SITE_URL}>
          Confirmer mon email
        </Button>

        <Text style={textSmall}>
          Ce lien expire dans {expiresInDays} jours. Si vous n'êtes pas à
          l'origine de cette demande, vous pouvez simplement ignorer cet email.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          {SITE_NAME} — <Link href={SITE_URL} style={link}>casaminga.com</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ClaimVerificationEmail,
  subject: 'Confirmez votre revendication sur Casa Minga',
  displayName: 'Vérification de revendication',
  previewData: {
    fullName: 'Marie',
    placeName: 'Les Abeilles',
    verifyUrl: 'https://casaminga.com/verify-claim?token=demo',
    expiresInDays: 7,
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
const textSmall = { fontSize: '13px', color: '#81746e', lineHeight: '1.6', margin: '16px 0 14px' }
const button = {
  backgroundColor: '#D65D39', color: '#ffffff', fontSize: '15px',
  fontWeight: '500' as const, borderRadius: '999px',
  padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#eee5df', margin: '28px 0 20px' }
const link = { color: '#D65D39', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#a89890', margin: '14px 0 0' }
