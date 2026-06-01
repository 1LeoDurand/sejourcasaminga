/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as exchangeRequestSent } from './exchange-request-sent.tsx'
import { template as exchangeRequestReceived } from './exchange-request-received.tsx'
import { template as exchangeRequestAccepted } from './exchange-request-accepted.tsx'
import { template as exchangeRequestDeclined } from './exchange-request-declined.tsx'
import { template as feedbackReceived } from './feedback-received.tsx'
import { template as welcome } from './welcome.tsx'
import { template as profileIncompleteReminder } from './profile-incomplete-reminder.tsx'
import { template as newMessage } from './new-message.tsx'
import { template as weeklyDigest } from './weekly-digest.tsx'
import { template as referralInvite } from './referral-invite.tsx'
import { template as claimVerification } from './claim-verification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'exchange-request-sent': exchangeRequestSent,
  'exchange-request-received': exchangeRequestReceived,
  'exchange-request-accepted': exchangeRequestAccepted,
  'exchange-request-declined': exchangeRequestDeclined,
  'feedback-received': feedbackReceived,
  'welcome': welcome,
  'profile-incomplete-reminder': profileIncompleteReminder,
  'new-message': newMessage,
  'weekly-digest': weeklyDigest,
  'referral-invite': referralInvite,
  'claim-verification': claimVerification,
}

