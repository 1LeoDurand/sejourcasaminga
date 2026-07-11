/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <BrandLayout preview={`Vous êtes invité·e à rejoindre ${siteName}`}>
    <Heading style={brand.h1}>Vous êtes invité·e</Heading>
    <Text style={brand.text}>
      Vous avez été invité·e à rejoindre{' '}
      <Link href={siteUrl} style={brand.link}>
        <strong>{siteName}</strong>
      </Link>
      , la communauté d'échange entre habitats collectifs. Cliquez ci-dessous pour accepter
      l'invitation et créer votre compte.
    </Text>
    <Button style={brand.button} href={confirmationUrl}>
      Accepter l'invitation
    </Button>
    <Text style={brand.textSmall}>
      Si vous n'attendiez pas cette invitation, vous pouvez ignorer ce message.
    </Text>
  </BrandLayout>
)

export default InviteEmail
