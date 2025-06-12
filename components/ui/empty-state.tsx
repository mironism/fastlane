import React from 'react'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="border rounded-lg">
      <p className="text-center text-muted-foreground p-8">{message}</p>
    </div>
  )
} 