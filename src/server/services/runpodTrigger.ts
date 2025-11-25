/**
 * RunPod Serverless Trigger Service
 * Triggers the RunPod serverless worker when an agent session is created
 */

const RUNPOD_SERVERLESS_ENDPOINT = process.env.RUNPOD_SERVERLESS_ENDPOINT
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY

export async function triggerRunPodServerlessWorker(
  agentSessionId: string
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  // If serverless not configured, skip (worker will poll instead)
  if (!RUNPOD_SERVERLESS_ENDPOINT || !RUNPOD_API_KEY) {
    console.log('[RunPodTrigger] Serverless not configured, worker will poll for session')
    return { success: true }
  }

  try {
    console.log(`[RunPodTrigger] Triggering serverless worker for session: ${agentSessionId}`)

    const response = await fetch(RUNPOD_SERVERLESS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          agentSessionId,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[RunPodTrigger] Error triggering serverless:', errorText)
      return {
        success: false,
        error: `RunPod error: ${response.statusText}`,
      }
    }

    const data = await response.json()
    console.log('[RunPodTrigger] Serverless worker triggered successfully:', data.id)

    return {
      success: true,
      jobId: data.id,
    }
  } catch (error: any) {
    console.error('[RunPodTrigger] Failed to trigger serverless worker:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

