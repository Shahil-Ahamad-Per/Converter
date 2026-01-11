"use client"

interface ProcessingStatusProps {
  message: string
}

export function ProcessingStatus({ message }: ProcessingStatusProps) {
  return (
    <div className="fixed bottom-4 right-4 rounded-lg border border-border bg-card p-4 shadow-lg">
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  )
}
