const ALLOWED_HOST = 'www.sec.gov'

export function isAllowedSecDocumentUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname === ALLOWED_HOST
  } catch {
    return false
  }
}
