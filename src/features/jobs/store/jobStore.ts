import { create } from 'zustand'
import type { Job, JobSSEEvent } from '../../../types/job.types'

interface JobState {
  jobs: Record<string, Job>
  activeJobId: string | null
  setJob: (job: Job) => void
  updateJobFromSSE: (jobId: string, event: JobSSEEvent) => void
  setActiveJob: (jobId: string) => void
}

export const useJobStore = create<JobState>((set) => ({
  jobs: {},
  activeJobId: null,
  setJob: (job) =>
    set((state) => ({ jobs: { ...state.jobs, [job._id]: job } })),
  updateJobFromSSE: (jobId, event) =>
    set((state) => ({
      jobs: {
        ...state.jobs,
        [jobId]: { ...state.jobs[jobId], ...event },
      },
    })),
  setActiveJob: (jobId) => set({ activeJobId: jobId }),
}))
