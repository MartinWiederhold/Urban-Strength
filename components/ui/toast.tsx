"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: "success" | "error" | "info"
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-medium text-sm font-medium max-w-sm animate-fade-in",
        type === "success" && "bg-primary/10 border-primary/30 text-primary",
        type === "error" && "bg-destructive/10 border-destructive/30 text-destructive",
        type === "info" && "bg-background border-border text-foreground"
      )}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-current/60 hover:text-current transition-colors">✕</button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}
