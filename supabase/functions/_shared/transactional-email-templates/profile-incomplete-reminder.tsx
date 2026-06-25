/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, Hr, brand } from './BrandLayout.tsx'

const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  firstName?: string
}

const ProfileIncompleteReminderEmail = ({ firstName }: Props) => (
  <BrandLayout preview="Votre lieu mérite d'être connu — quelques minutes suffisent">
    <Heading style={brand.h1}>
      {firstName ? `${firstName}, votre lieu mérite d'être vu` : 'Votre lieu mérite d\'être vu'}
    </Heading>

    <Text style={brand.text}>
      Vous avez rejoint <strong>Casa Minga Séjours</strong> il y a quelques jours — nous en
      sommes ravis. Pour rencontrer d'autres habitats et commencer à échanger,
      il manque encore une petite étape : <strong>présenter votre lieu</strong>.
    </Text>

    <Text style={brand.text}>
      Rien de compliqué. Quelques photos, une description honnête, vos valeurs.
      C'est ce qui donne envie aux autres collectifs de venir vous rencontrer.
    </Text>

    <Button style={brand.button} href={`${SITE_URL}/dashboard`}>
      Présenter mon lieu
    </Button>

    <Hr style={brand.hr} />

    <Text style={brand.textSmall}>
      <strong>Pas encore prêt ?</strong> Vous pouvez aussi simplement explorer
      les <Link href={`${SITE_URL}/discover`} style={brand.link}>habitats déjà inscrits</Link>{' '}
      pour vous inspirer.
    </Text>
  </BrandLayout>
)

export const template = {
  component: ProfileIncompleteReminderEmail,
  subject: 'Votre lieu mérite d\'être connu 🏡',
  displayName: 'Relance profil incomplet (J+3)',
  previewData: { firstName: 'Léa' },
} satisfies TemplateEntry
