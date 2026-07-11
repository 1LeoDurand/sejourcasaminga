/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, brand } from '../transactional-email-templates/BrandLayout.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandLayout preview="Votre code de vérification Casa Minga Séjours">
    <Heading style={brand.h1}>Code de vérification</Heading>
    <Text style={brand.text}>Utilisez le code ci-dessous pour confirmer votre identité :</Text>
    <Text style={codeStyle}>{token}</Text>
    <Text style={brand.textSmall}>
      Ce code expirera sous peu. Si vous n'avez pas fait cette demande, ignorez cet email.
    </Text>
  </BrandLayout>
)

export default ReauthenticationEmail

const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '30px',
  fontWeight: 'bold' as const,
  color: brand.terracotta,
  backgroundColor: brand.cream,
  borderRadius: '12px',
  padding: '16px 0',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  letterSpacing: '6px',
}
