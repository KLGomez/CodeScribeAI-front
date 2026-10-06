import { useSSE } from '../../../hooks/useSSE'
import { useJobStore } from '../store/jobStore'
import type { JobSSEEvent } from '../../../types/job.types'

/**
 * Subscribes to the SSE stream for a specific job with typed stages and progress.
 * Automatically closes when the job reaches a terminal state (done | error).
 */
export function useJobSSE(jobId: string | null) {
  const { updateJobFromSSE } = useJobStore()

  const { close } = useSSE<JobSSEEvent>({
    url: `/jobs/${jobId}/stream`,
    enabled: !!jobId,
    onMessage: (data) => {
      if (!jobId) return
      updateJobFromSSE(jobId, data)
      if (data.status === 'done' || data.status === 'error') {
        close()
      }
    },
    onError: () => {
      if (jobId) {
        updateJobFromSSE(jobId, {
          status: 'error',
          progress: 0,
          errorCode: 'AI_UNAVAILABLE',
          errorMessage: 'Se interrumpió la conexión en tiempo real con el servidor de análisis.',
        })
      }
    },
  })
}
