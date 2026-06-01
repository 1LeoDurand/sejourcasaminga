/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  firstName?: string
}

const ProfileIncompleteReminderEmail = ({ firstName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre lieu mérite d'être connu — quelques minutes suffisent</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {firstName ? `${firstName}, votre lieu mérite d'être vu` : 'Votre lieu mérite d\'être vu'}
        </Heading>

        <Text style={text}>
          Vous avez rejoint <strong>Casa Minga</strong> il y a quelques jours — nous en
          sommes ravis. Pour rencontrer d'autres habitats et commencer à échanger,
          il manque encore une petite étape : <strong>présenter votre lieu</strong>.
        </Text>

        <Text style={text}>
          Rien de compliqué. Quelques photos, une description honnête, vos valeurs.
          C'est ce qui donne envie aux autres collectifs de venir vous rencontrer.
        </Text>

        <Button style={button} href={`${SITE_URL}/dashboard`}>
          Présenter mon lieu
        </Button>

        <Hr style={hr} />

        <Text style={textSmall}>
          <strong>Pas encore prêt ?</strong> Vous pouvez aussi simplement explorer
          les <Link href={`${SITE_URL}/discover`} style={link}>habitats déjà inscrits</Link>{' '}
          pour vous inspirer.
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
  component: ProfileIncompleteReminderEmail,
  subject: 'Votre lieu mérite d\'être connu 🏡',
  displayName: 'Relance profil incomplet (J+3)',
  previewData: { firstName: 'Léa' },
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
const button = {
  backgroundColor: '#D65D39', color: '#ffffff', fontSize: '15px',
  fontWeight: '500' as const, borderRadius: '999px',
  padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#eee5df', margin: '28px 0 20px' }
const link = { color: '#D65D39', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#a89890', margin: '14px 0 0' }
