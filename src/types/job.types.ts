export type JobStatus = 'queued' | 'processing' | 'done' | 'error'

export interface Job {
  _id: string
  repoUrl: string
  status: JobStatus
  documentationId?: string
  errorMessage?: string
  progress: number
  tokensUsed?: number
  durationMs?: number
  createdAt: string
  updatedAt: string
}

export interface JobSSEEvent {
  status: JobStatus
  progress: number
  documentationId?: string
  errorMessage?: string
}
