import { useEffect, useState } from 'react'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

export default function ProgressTracker({ jobId, onComplete }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!jobId) return
    let alive = true

    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`)
        const d = await res.json()
        if (!alive) return
        setData(d)
        if (d.status === 'complete') {
          onComplete?.()
        } else if (d.status === 'error') {
          // stop polling
        } else {
          setTimeout(poll, 800)
        }
      } catch {
        if (alive) setTimeout(poll, 2000)
      }
    }
    poll()
    return () => { alive = false }
  }, [jobId, onComplete])

  if (!data) return null

  const steps = data.steps_total || []
  const completed = new Set(data.steps_completed || [])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <p className="text-slate-400 text-sm mt-2 text-center">{data.progress}% complete</p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completed.has(step)
          const isCurrent = data.step === step && !isDone
          return (
            <div key={step} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 shrink-0" />
              )}
              <span className={`text-sm ${isDone ? 'text-slate-300' : isCurrent ? 'text-white font-medium' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {data.status === 'error' && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          Error: {data.error}
        </div>
      )}
    </div>
  )
}
