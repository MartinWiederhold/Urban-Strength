'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'

interface AvailabilityCalendarProps {
  onSelectSlot: (slot: Availability) => void
  selectedSlot: Availability | null
}

export default function AvailabilityCalendar({ onSelectSlot, selectedSlot }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<Availability[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('is_available', true)
        .or(`date.gte.${start},recurring_weekly.eq.true`)
        .lte('date', end)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      setAvailability(data ?? [])
      setIsLoading(false)
    }
    fetchAvailability()
  }, [currentMonth])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const getAvailableSlots = (date: Date): Availability[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOfWeek = date.getDay()
    return availability.filter(slot =>
      (slot.date === dateStr) ||
      (slot.recurring_weekly && slot.day_of_week === dayOfWeek)
    )
  }

  const hasAvailability = (date: Date): boolean => {
    if (isPast(startOfDay(date)) && !isToday(date)) return false
    return getAvailableSlots(date).length > 0
  }

  const daySlots = selectedDay ? getAvailableSlots(selectedDay) : []

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for month start offset */}
        {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const available = hasAvailability(day)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const past = isPast(startOfDay(day)) && !isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => { if (available) setSelectedDay(day) }}
              disabled={!available || past}
              className={`
                relative aspect-square rounded-lg text-sm font-medium transition-all
                ${past ? 'opacity-30 cursor-not-allowed' : ''}
                ${available && !past ? 'cursor-pointer' : ''}
                ${isSelected ? 'bg-primary text-white shadow-medium' : ''}
                ${available && !isSelected && !past ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                ${!available && !past ? 'text-muted-foreground' : ''}
                ${isToday(day) && !isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
              `}
            >
              {format(day, 'd')}
              {available && !past && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-60" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/10" />
          <span>Verfügbar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>Ausgewählt</span>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Uhrzeiten am {format(selectedDay, 'dd. MMMM yyyy', { locale: de })}
          </h4>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : daySlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine freien Zeiten an diesem Tag.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {daySlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
