// Login page — server component.
//
// Reads OWNER_REGISTRATION_MODE on the server so the registration UI adapts
// to the deployment without any client-side env access, and the API enforces
// the same mode independently of what this page renders.

import { getOwnerRegistrationMode } from '@/lib/app-config'
import LoginForm from './LoginForm'

export default function LoginPage() {
  const registrationMode = getOwnerRegistrationMode()
  return <LoginForm registrationMode={registrationMode} />
}
