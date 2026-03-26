import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Poster | Personal Training Zurich',
  robots: { index: false, follow: false },
}

export default function QRCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
