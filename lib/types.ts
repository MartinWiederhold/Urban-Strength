export type UserRole = 'admin' | 'customer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  notes: string | null
  customer_status: 'new' | 'active' | 'inactive' | 'vip'
  customer_tags: string[] | null
  fitness_goals: string | null
  health_notes: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  description: string | null
  price: number
  duration_minutes: number
  features: string[] | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Availability {
  id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  recurring_weekly: boolean
  day_of_week: number | null
  recurring_end_date: string | null
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string | null
  service_id: string
  availability_id: string | null
  booking_date: string
  start_time: string
  end_time: string
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled' | 'no_show'
  age: number | null
  gender: string | null
  fitness_level: string | null
  goals: string | null
  health_conditions: string | null
  how_found_us: string | null
  notes: string | null
  paid: boolean
  paid_amount: number
  first_name: string | null
  last_name: string | null
  customer_email: string | null
  customer_phone: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  services?: Service
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface TrainingPlan {
  id: string
  customer_id: string
  title: string
  type: 'training' | 'nutrition' | 'general'
  content: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Analytics types ────────────────────────────────────────────────────────

export interface AnalyticsStats {
  totalRevenue: number
  paidRevenue: number
  totalBookings: number
  totalCustomers: number
  paidCount: number
  unpaidCount: number
  avgRevenue: number
  conversionRate: number
}

export interface AnalyticsChartData {
  monthlyData: Array<{ month: string; bookings: number; revenue: number }>
  weeklyData:  Array<{ week: string; revenue: number }>
  statusData:  Array<{ name: string; value: number }>
  sourceData:  Array<{ name: string; value: number }>
  serviceRevData: Array<{ name: string; revenue: number; count: number }>
  paymentData: Array<{ name: string; value: number }>
}
