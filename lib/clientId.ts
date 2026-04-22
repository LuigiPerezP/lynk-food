export function getClientId(mesa: number): string {
  const key = `lynkfood_client_id_${mesa}`
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

export function clearClientId(mesa: number) {
  localStorage.removeItem(`lynkfood_client_id_${mesa}`)
}
