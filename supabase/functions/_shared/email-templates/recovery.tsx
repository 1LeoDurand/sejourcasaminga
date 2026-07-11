/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <BrandLayout preview={`Réinitialisez votre mot de passe ${siteName}`}>
    <Heading style={brand.h1}>Réinitialiser votre mot de passe</Heading>
    <Text style={brand.text}>
      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {siteName}.
      Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
    </Text>
    <Button style={brand.button} href={confirmationUrl}>
      Choisir un nouveau mot de passe
    </Button>
    <Text style={brand.textSmall}>
      Si vous n'êtes pas à l'origine de cette demande, ignorez ce message — votre mot de passe restera inchangé.
    </Text>
  </BrandLayout>
)

export default RecoveryEmail
