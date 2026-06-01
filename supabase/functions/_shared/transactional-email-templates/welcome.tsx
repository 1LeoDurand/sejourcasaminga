/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  firstName?: string
  referralCode?: string
}

const WelcomeEmail = ({ firstName, referralCode }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bienvenue dans la communauté Casa Minga 🌿</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {firstName ? `Bienvenue ${firstName},` : 'Bienvenue,'}
        </Heading>

        <Text style={text}>
          Heureux·se de vous accueillir sur <strong>Casa Minga</strong>, la communauté
          d'échange entre habitats collectifs, écolieux et lieux de vie partagés.
        </Text>

        <Text style={text}>
          Pour bien commencer, voici trois pas simples :
        </Text>

        <Section style={card}>
          <Text style={step}><strong>1.</strong> Complétez votre profil — quelques mots, une photo, vos langues.</Text>
          <Text style={step}><strong>2.</strong> Présentez votre lieu (ou réclamez-le s'il existe déjà).</Text>
          <Text style={step}><strong>3.</strong> Ouvrez un séjour et découvrez les habitats déjà inscrits.</Text>
        </Section>

        <Button style={button} href={`${SITE_URL}/dashboard`}>
          Commencer mon parcours
        </Button>

        {referralCode && (
          <>
            <Hr style={hr} />
            <Text style={text}>
              <strong>Votre code de parrainage :</strong>{' '}
              <span style={code}>{referralCode}</span>
            </Text>
            <Text style={textSmall}>
              Partagez-le avec vos proches : vous gagnez tous les deux des points
              pour faire vivre la communauté.
            </Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={textSmall}>
          Une question ? Répondez simplement à cet email, nous lisons tout.
        </Text>
        <Text style={footer}>
          {SITE_NAME} —{' '}
          <Link href={SITE_URL} style={link}>casaminga.com</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Bienvenue dans la communauté Casa Minga 🌿',
  displayName: 'Email de bienvenue',
  previewData: { firstName: 'Léa', referralCode: 'CM-a1b2c3d4' },
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
const step = { fontSize: '14px', color: '#2e2623', margin: '0 0 10px', lineHeight: '1.55' }
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '18px 20px', margin: '6px 0 24px' }
const button = {
  backgroundColor: '#D65D39', color: '#ffffff', fontSize: '15px',
  fontWeight: '500' as const, borderRadius: '999px',
  padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#eee5df', margin: '28px 0 20px' }
const code = {
  backgroundColor: '#fbf7f4', padding: '3px 9px', borderRadius: '6px',
  fontFamily: 'monospace', color: '#D65D39', fontSize: '14px',
}
const link = { color: '#D65D39', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#a89890', margin: '14px 0 0' }
