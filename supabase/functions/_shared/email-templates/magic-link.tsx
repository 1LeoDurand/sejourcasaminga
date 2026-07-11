/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <BrandLayout preview={`Votre lien de connexion ${siteName}`}>
    <Heading style={brand.h1}>Votre lien de connexion</Heading>
    <Text style={brand.text}>
      Cliquez sur le bouton ci-dessous pour vous connecter à {siteName}. Ce lien expirera sous peu.
    </Text>
    <Button style={brand.button} href={confirmationUrl}>
      Me connecter
    </Button>
    <Text style={brand.textSmall}>
      Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
    </Text>
  </BrandLayout>
)

export default MagicLinkEmail
