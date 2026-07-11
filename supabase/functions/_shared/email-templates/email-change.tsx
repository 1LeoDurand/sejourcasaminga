/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <BrandLayout preview={`Confirmez le changement d'adresse email ${siteName}`}>
    <Heading style={brand.h1}>Confirmer votre nouvelle adresse</Heading>
    <Text style={brand.text}>
      Vous avez demandé à changer l'adresse email associée à votre compte {siteName}, de{' '}
      <Link href={`mailto:${email}`} style={brand.link}>
        {email}
      </Link>{' '}
      vers{' '}
      <Link href={`mailto:${newEmail}`} style={brand.link}>
        {newEmail}
      </Link>
      .
    </Text>
    <Text style={brand.text}>Cliquez ci-dessous pour confirmer ce changement :</Text>
    <Button style={brand.button} href={confirmationUrl}>
      Confirmer le changement
    </Button>
    <Text style={brand.textSmall}>
      Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.
    </Text>
  </BrandLayout>
)

export default EmailChangeEmail
