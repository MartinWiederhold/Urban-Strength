import type { Booking } from '@/lib/types'

type BookingWithProfile = Booking & {
  profiles?: { full_name?: string | null; email?: string | null } | null
}

/** Anzeigename: Profil, sonst Vor-/Nachname aus der Buchung (auch Gastbuchungen ohne customer_id). */
export function getBookingCustomerDisplayName(booking: BookingWithProfile): string {
  const fromProfile = booking.profiles?.full_name?.trim()
  if (fromProfile) return fromProfile
  const fn = booking.first_name?.trim() ?? ''
  const ln = booking.last_name?.trim() ?? ''
  const fromBooking = [fn, ln].filter(Boolean).join(' ')
  if (fromBooking) return fromBooking
  return 'Unbekannt'
}

/** Kurzes Alter für Listen, z. B. "32 J." – nur wenn in der Buchung erfasst. */
export function getBookingAgeLabel(booking: Booking): string | null {
  if (booking.age == null || Number.isNaN(Number(booking.age))) return null
  return `${booking.age} J.`
}
