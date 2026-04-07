import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Activity, AlertTriangle, Shield, Pill } from 'lucide-react'

const CATEGORY_COLORS = {
  'Drug Metabolism': '#6366f1',
  'Methylation': '#8b5cf6',
  'Neurotransmitters': '#a78bfa',
  'Caffeine Response': '#c084fc',
  'Sleep/Circadian': '#818cf8',
  'Fitness': '#22d3ee',
  'Nutrition': '#34d399',
  'Cardiovascular': '#f87171',
  'Inflammation': '#fb923c',
  'Iron Metabolism': '#fbbf24',
  'Autoimmune': '#f472b6',
  'Skin': '#e879f9',
  'Longevity': '#2dd4bf',
  'Respiratory': '#94a3b8',
  'Detoxification': '#a3e635',
  'Alcohol': '#fca5a5',
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function ExecutiveSummary({ data }) {
  const { summary, findings, disease, pharmgkb_findings } = data

  const categoryData = Object.entries(data.by_category || {}).map(([name, items]) => ({
    name,
    value: items.length,
    fill: CATEGORY_COLORS[name] || '#64748b',
  }))

  const highImpact = findings?.filter(f => f.magnitude >= 3) || []

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="SNPs Analyzed"
          value={summary?.analyzed_snps || 0}
          sub={`of ${(summary?.total_snps || 0).toLocaleString()} total`}
          color="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Impact"
          value={summary?.high_impact || 0}
          sub="magnitude 3+"
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard
          icon={Shield}
          label="Disease Variants"
          value={(disease?.affected?.length || 0) + (disease?.carriers?.length || 0)}
          sub={`${disease?.affected?.length || 0} affected, ${disease?.carriers?.length || 0} carrier`}
          color="bg-red-500/20 text-red-400"
        />
        <StatCard
          icon={Pill}
          label="Drug Interactions"
          value={pharmgkb_findings?.length || 0}
          sub="PharmGKB findings"
          color="bg-purple-500/20 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Findings by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  formatter={(value, name) => [`${value} findings`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map(c => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: c.fill }} />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>

        {/* High Impact List */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Priority Findings (High Impact)</h3>
          {highImpact.length === 0 ? (
            <p className="text-slate-500 text-sm">No high-impact findings detected.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {highImpact.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                  <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold shrink-0">
                    {f.magnitude}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{f.gene} <span className="text-slate-500">({f.category})</span></p>
                    <p className="text-slate-400 text-xs mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
