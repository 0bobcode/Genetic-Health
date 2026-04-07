const COLORS = {
  0: 'bg-slate-500/20 text-slate-300',
  1: 'bg-emerald-500/20 text-emerald-300',
  2: 'bg-yellow-500/20 text-yellow-300',
  3: 'bg-orange-500/20 text-orange-300',
  4: 'bg-red-500/20 text-red-300',
  5: 'bg-red-600/30 text-red-200',
  6: 'bg-red-700/40 text-red-100',
}

const LABELS = {
  0: 'Info',
  1: 'Low',
  2: 'Moderate',
  3: 'High',
  4: 'Very High',
  5: 'Critical',
  6: 'Critical',
}

export default function ImpactBadge({ magnitude }) {
  const m = Math.min(Math.max(Math.round(magnitude), 0), 6)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[m]}`}>
      {LABELS[m]} ({m})
    </span>
  )
}
