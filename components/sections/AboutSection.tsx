'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Award, Users, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { icon: Award, value: '5+', label: 'Jahre Erfahrung' },
  { icon: Users, value: '100+', label: 'Kunden trainiert' },
  { icon: Clock, value: '1000+', label: 'Trainingsstunden' },
]

export default function AboutSection() {
  return (
    <section className="section-padding bg-background" id="ueber-martin">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl bg-muted overflow-hidden relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                <div className="w-20 h-20 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                  <Users className="w-10 h-10" />
                </div>
                <span className="text-sm">Martin – Personal Trainer Zürich</span>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-xl p-4 shadow-medium">
              <p className="text-2xl font-bold">5+</p>
              <p className="text-xs text-white/80">Jahre<br/>Erfahrung</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
              Dein Personal Trainer in Zürich – Martin
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Als zertifizierter Personal Trainer helfe ich dir, deine Fitnessziele zu erreichen – egal ob Muskelaufbau, Fettabbau oder allgemeine Fitness. Mein Ansatz ist einfach: individuell, effizient und nachhaltig.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Ich trainiere im Gym am Oberer Heuelsteig 30 in Zürich. Mit mir bekommst du keine Standard-Programme – sondern ein Training, das wirklich zu dir und deinen Zielen passt.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-secondary">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link href="/about">
              <Button variant="outline" size="lg" className="group">
                Mehr über Martin erfahren
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
