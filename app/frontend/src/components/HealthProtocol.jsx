import { Beaker, Salad, HeartPulse, ClipboardList } from 'lucide-react'

function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-white font-semibold">{title}</h3>
    </div>
  )
}

function RecCard({ title, detail, gene }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        <span className="text-xs text-slate-500 font-mono">{gene}</span>
      </div>
      <p className="text-slate-400 text-sm">{detail}</p>
    </div>
  )
}

export default function HealthProtocol({ protocol }) {
  if (!protocol) return <p className="text-slate-500">No protocol data available.</p>

  const { supplements, diet, lifestyle, monitoring } = protocol

  return (
    <div className="space-y-10">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-200">
        Discuss all supplements and changes with your healthcare provider before starting.
      </div>

      {/* Supplements */}
      <section>
        <SectionHeader icon={Beaker} title="Supplement Recommendations" color="bg-purple-500/20 text-purple-400" />
        {supplements?.length === 0 ? (
          <p className="text-slate-500 text-sm">No specific supplements indicated.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Supplement</th>
                  <th className="text-left px-3 py-3 font-medium">Dose</th>
                  <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Reason</th>
                  <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Gene</th>
                </tr>
              </thead>
              <tbody>
                {supplements.map((s, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                    <td className="px-3 py-3 text-indigo-300 text-xs font-mono">{s.dose}</td>
                    <td className="px-3 py-3 text-slate-400 hidden md:table-cell">{s.reason}</td>
                    <td className="px-3 py-3 text-slate-500 hidden sm:table-cell">{s.gene}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Diet */}
      <section>
        <SectionHeader icon={Salad} title="Dietary Recommendations" color="bg-emerald-500/20 text-emerald-400" />
        {diet?.length === 0 ? (
          <p className="text-slate-500 text-sm">Standard healthy eating recommended.</p>
        ) : (
          <div className="grid gap-3">
            {diet.map((r, i) => <RecCard key={i} {...r} />)}
          </div>
        )}
      </section>

      {/* Lifestyle */}
      <section>
        <SectionHeader icon={HeartPulse} title="Lifestyle Recommendations" color="bg-cyan-500/20 text-cyan-400" />
        {lifestyle?.length === 0 ? (
          <p className="text-slate-500 text-sm">Standard healthy lifestyle recommended.</p>
        ) : (
          <div className="grid gap-3">
            {lifestyle.map((r, i) => <RecCard key={i} {...r} />)}
          </div>
        )}
      </section>

      {/* Monitoring */}
      <section>
        <SectionHeader icon={ClipboardList} title="Monitoring Schedule" color="bg-blue-500/20 text-blue-400" />
        {monitoring?.length === 0 ? (
          <p className="text-slate-500 text-sm">Standard health monitoring for age.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Test</th>
                  <th className="text-left px-3 py-3 font-medium">Frequency</th>
                  <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Target</th>
                  <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Reason</th>
                </tr>
              </thead>
              <tbody>
                {monitoring.map((m, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white font-medium">{m.test}</td>
                    <td className="px-3 py-3 text-slate-300">{m.frequency}</td>
                    <td className="px-3 py-3 text-emerald-300 text-xs hidden sm:table-cell">{m.target}</td>
                    <td className="px-3 py-3 text-slate-500 hidden md:table-cell">{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
