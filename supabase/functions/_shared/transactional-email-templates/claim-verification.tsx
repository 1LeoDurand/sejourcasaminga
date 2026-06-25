/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, Hr, brand } from './BrandLayout.tsx'

const SITE_NAME = 'Casa Minga Séjours'
const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  fullName?: string
  placeName?: string
  verifyUrl?: string
  expiresInDays?: number
}

const ClaimVerificationEmail = ({ fullName, placeName, verifyUrl, expiresInDays = 7 }: Props) => (
  <BrandLayout preview={`Confirmez votre demande de revendication sur ${SITE_NAME}`}>
    <Heading style={brand.h1}>
      {fullName ? `Bonjour ${fullName},` : 'Bonjour,'}
    </Heading>

    <Text style={brand.text}>
      Nous avons reçu votre demande de revendication pour le lieu{' '}
      <strong>{placeName || 'concerné'}</strong> sur {SITE_NAME}.
    </Text>

    <Text style={brand.text}>
      Pour confirmer que cette adresse email vous appartient bien, cliquez
      sur le bouton ci-dessous. Notre équipe examinera ensuite votre
      demande avant de vous donner accès à la gestion de la fiche.
    </Text>

    <Button style={brand.button} href={verifyUrl || SITE_URL}>
      Confirmer mon email
    </Button>

    <Text style={brand.textSmall}>
      Ce lien expire dans {expiresInDays} jours. Si vous n'êtes pas à
      l'origine de cette demande, vous pouvez simplement ignorer cet email.
    </Text>

    <Hr style={brand.hr} />
  </BrandLayout>
)

export const template = {
  component: ClaimVerificationEmail,
  subject: 'Confirmez votre revendication sur Casa Minga Séjours',
  displayName: 'Vérification de revendication',
  previewData: {
    fullName: 'Marie',
    placeName: 'Les Abeilles',
    verifyUrl: 'https://sejour.casaminga.com/verify-claim?token=demo',
    expiresInDays: 7,
  },
} satisfies TemplateEntry
