/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, Hr, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  firstName?: string
  referralCode?: string
}

const WelcomeEmail = ({ firstName, referralCode }: Props) => (
  <BrandLayout preview="Bienvenue dans la communauté Casa Minga 🌿">
    <Heading style={brand.h1}>
      {firstName ? `Bienvenue ${firstName},` : 'Bienvenue,'}
    </Heading>

    <Text style={brand.text}>
      Heureux·se de vous accueillir sur <strong>Casa Minga Séjours</strong>, la communauté
      d'échange entre habitats collectifs, écolieux et lieux de vie partagés.
    </Text>

    <Text style={brand.text}>
      Pour bien commencer, voici trois pas simples :
    </Text>

    <Section style={brand.card}>
      <Text style={step}><strong>1.</strong> Complétez votre profil — quelques mots, une photo, vos langues.</Text>
      <Text style={step}><strong>2.</strong> Présentez votre lieu (ou réclamez-le s'il existe déjà).</Text>
      <Text style={step}><strong>3.</strong> Ouvrez un séjour et découvrez les habitats déjà inscrits.</Text>
    </Section>

    <Button style={brand.button} href={`${SITE_URL}/dashboard`}>
      Commencer mon parcours
    </Button>

    {referralCode && (
      <>
        <Hr style={brand.hr} />
        <Text style={brand.text}>
          <strong>Votre code de parrainage :</strong>{' '}
          <span style={brand.code}>{referralCode}</span>
        </Text>
        <Text style={brand.textSmall}>
          Partagez-le avec vos proches : vous gagnez tous les deux des points
          pour faire vivre la communauté.
        </Text>
      </>
    )}

    <Hr style={brand.hr} />
    <Text style={brand.textSmall}>
      Une question ? Répondez simplement à cet email, nous lisons tout.
    </Text>
  </BrandLayout>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Bienvenue dans la communauté Casa Minga 🌿',
  displayName: 'Email de bienvenue',
  previewData: { firstName: 'Léa', referralCode: 'CM-a1b2c3d4' },
} satisfies TemplateEntry

const step = { fontSize: '14px', color: brand.ink, margin: '0 0 10px', lineHeight: '1.55' }
