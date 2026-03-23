'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, ChevronDown, ChevronUp, Dumbbell, Apple, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { TrainingPlan } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const typeIcon = { training: Dumbbell, nutrition: Apple, general: FileText }
const typeLabel = { training: 'Trainingsplan', nutrition: 'Ernährungsplan', general: 'Allgemeiner Plan' }
const typeColor = { training: 'bg-primary/10 text-primary', nutrition: 'bg-green-50 text-green-700', general: 'bg-blue-50 text-blue-700' }

function PlanCard({ plan }: { plan: TrainingPlan }) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = typeIcon[plan.type] ?? FileText
  const content = plan.content as Record<string, unknown>

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor[plan.type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{plan.title}</p>
            <p className="text-xs text-muted-foreground">
              {typeLabel[plan.type]} · Erstellt {format(new Date(plan.created_at), 'dd. MMM yyyy', { locale: de })}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 border-t border-border pt-4">
            {content.description != null && (
              <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{String(content.description)}</p>
            )}
            {Array.isArray(content.exercises) && content.exercises.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Übungen</p>
                {(content.exercises as Array<Record<string, unknown>>).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                    <div>
                      <p className="font-medium">{String(ex.name ?? '')}</p>
                      {ex.sets != null && ex.reps != null && (
                        <p className="text-xs text-muted-foreground">{String(ex.sets)} Sätze × {String(ex.reps)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!content.description && !Array.isArray(content.exercises) && (
              <p className="text-sm text-muted-foreground">Keine Inhalte vorhanden.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function PlansPage() {
  const { profile } = useAuth()
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('training_plans')
        .select('*')
        .eq('customer_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setPlans((data as TrainingPlan[]) ?? [])
      setIsLoading(false)
    }
    load()
  }, [profile])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meine Pläne</h1>
        <p className="text-muted-foreground mt-1">Trainingspläne und Ernährungspläne von Martin.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Noch keine Pläne vorhanden.</p>
          <p className="text-xs text-muted-foreground mt-1">Martin erstellt deinen persönlichen Plan nach eurer ersten Session.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
