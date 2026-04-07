import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Dna, BarChart3, List, AlertTriangle, Pill, HeartPulse, ArrowLeft } from 'lucide-react'
import ProgressTracker from '../components/ProgressTracker'
import ExecutiveSummary from '../components/ExecutiveSummary'
import FindingsTable from '../components/FindingsTable'
import DiseaseRisk from '../components/DiseaseRisk'
import DrugInteractions from '../components/DrugInteractions'
import HealthProtocol from '../components/HealthProtocol'

const TABS = [
  { id: 'summary', label: 'Overview', icon: BarChart3 },
  { id: 'findings', label: 'Findings', icon: List },
  { id: 'disease', label: 'Disease Risk', icon: AlertTriangle },
  { id: 'drugs', label: 'Drug Interactions', icon: Pill },
  { id: 'protocol', label: 'Health Protocol', icon: HeartPulse },
]

export default function ResultsPage() {
  const { jobId } = useParams()
  const [done, setDone] = useState(false)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('summary')
  const [loading, setLoading] = useState(false)

  const onComplete = useCallback(() => setDone(true), [])

  useEffect(() => {
    if (!done) return
    setLoading(true)
    fetch(`/api/results/${jobId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [done, jobId])

  const renderTab = () => {
    if (!data) return null
    switch (tab) {
      case 'summary': return <ExecutiveSummary data={data} />
      case 'findings': return <FindingsTable findings={data.findings} byCategory={data.by_category} />
      case 'disease': return <DiseaseRisk disease={data.disease} />
      case 'drugs': return <DrugInteractions pharmgkb={data.pharmgkb_findings} disease={data.disease} />
      case 'protocol': return <HealthProtocol protocol={data.protocol} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Dna className="w-7 h-7 text-indigo-400" />
            <span className="text-xl font-bold text-white tracking-tight">SequenceMe</span>
          </Link>
        </div>

        {data && (
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </nav>
        )}

        <div className="p-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition">
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {!done ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Dna className="w-12 h-12 text-indigo-400 mx-auto mb-6 animate-pulse" />
              <h2 className="text-xl font-semibold text-white mb-6">Analyzing Your Genome</h2>
              <ProgressTracker jobId={jobId} onComplete={onComplete} />
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="p-6 lg:p-8 max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {TABS.find(t => t.id === tab)?.label}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {data.genome_count?.toLocaleString()} SNPs loaded
                {data.summary?.analyzed_snps ? ` · ${data.summary.analyzed_snps} analyzed` : ''}
              </p>
            </div>
            {renderTab()}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen text-slate-500">
            Failed to load results.
          </div>
        )}
      </main>
    </div>
  )
}
