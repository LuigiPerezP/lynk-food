interface AuthConfig {
  admin: string
  cocina: string
}

export async function getAuthConfig(): Promise<AuthConfig | null> {
  const admin = process.env.ADMIN_PASSWORD
  const cocina = process.env.KITCHEN_PASSWORD
  if (!admin || !cocina) return null
  return { admin, cocina }
}

export async function setAuthConfig(_config: Partial<AuthConfig>): Promise<void> {
  // passwords are managed via environment variables
}
