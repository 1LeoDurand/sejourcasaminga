/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <BrandLayout preview={`Bienvenue sur ${siteName} — confirmez votre adresse email`}>
    <Heading style={brand.h1}>Bienvenue sur Casa Minga Séjours</Heading>
    <Text style={brand.text}>
      Merci de rejoindre{' '}
      <Link href={siteUrl} style={brand.link}>
        <strong>{siteName}</strong>
      </Link>
      , la communauté d'échange entre habitats collectifs, écolieux et lieux de vie partagés.
    </Text>
    <Text style={brand.text}>
      Confirmez votre adresse{' '}
      <Link href={`mailto:${recipient}`} style={brand.link}>
        {recipient}
      </Link>{' '}
      pour activer votre compte :
    </Text>
    <Button style={brand.button} href={confirmationUrl}>
      Confirmer mon email
    </Button>
    <Text style={brand.textSmall}>
      Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.
    </Text>
  </BrandLayout>
)

export default SignupEmail
