import { Pill } from 'lucide-react'

function EvidenceBadge({ level }) {
  const colors = {
    '1A': 'bg-red-500/20 text-red-300',
    '1B': 'bg-red-500/20 text-red-300',
    '2A': 'bg-orange-500/20 text-orange-300',
    '2B': 'bg-yellow-500/20 text-yellow-300',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[level] || 'bg-slate-500/20 text-slate-300'}`}>
      {level}
    </span>
  )
}

export default function DrugInteractions({ pharmgkb, disease }) {
  const level1 = pharmgkb?.filter(f => f.level === '1A' || f.level === '1B') || []
  const level2 = pharmgkb?.filter(f => f.level === '2A' || f.level === '2B') || []
  const drugResponse = disease?.drug_response || []

  return (
    <div className="space-y-8">
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200">
        <strong>Share this section with prescribing physicians.</strong> These findings may affect drug dosing and selection.
      </div>

      {/* Level 1 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold">PharmGKB Level 1 (Clinical Guidelines Exist)</h3>
        </div>
        {level1.length === 0 ? (
          <p className="text-slate-500 text-sm">None detected.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Gene</th>
                  <th className="text-left px-3 py-3 font-medium">Level</th>
                  <th className="text-left px-3 py-3 font-medium">Drugs</th>
                  <th className="text-left px-3 py-3 font-medium">Genotype</th>
                </tr>
              </thead>
              <tbody>
                {level1.map((f, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white font-medium">{f.gene}</td>
                    <td className="px-3 py-3"><EvidenceBadge level={f.level} /></td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">{f.drugs}</td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">{f.genotype}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Level 2 */}
      <section>
        <h3 className="text-white font-semibold mb-4">PharmGKB Level 2 (Moderate Evidence)</h3>
        {level2.length === 0 ? (
          <p className="text-slate-500 text-sm">None detected.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Gene</th>
                  <th className="text-left px-3 py-3 font-medium">Level</th>
                  <th className="text-left px-3 py-3 font-medium">Drugs</th>
                  <th className="text-left px-3 py-3 font-medium">Genotype</th>
                </tr>
              </thead>
              <tbody>
                {level2.slice(0, 20).map((f, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white font-medium">{f.gene}</td>
                    <td className="px-3 py-3"><EvidenceBadge level={f.level} /></td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">{f.drugs}</td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">{f.genotype}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {level2.length > 20 && (
              <p className="text-slate-500 text-sm text-center py-3 border-t border-white/5">
                ...and {level2.length - 20} more Level 2 interactions
              </p>
            )}
          </div>
        )}
      </section>

      {/* ClinVar Drug Response */}
      {drugResponse.length > 0 && (
        <section>
          <h3 className="text-white font-semibold mb-4">ClinVar Drug Response Variants ({drugResponse.length})</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Gene</th>
                  <th className="text-left px-3 py-3 font-medium">rsID</th>
                  <th className="text-left px-3 py-3 font-medium">Genotype</th>
                  <th className="text-left px-3 py-3 font-medium">Drug / Response</th>
                </tr>
              </thead>
              <tbody>
                {drugResponse.slice(0, 20).map((f, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white font-medium">{f.gene || '—'}</td>
                    <td className="px-3 py-3 text-slate-400 font-mono text-xs">{f.rsid}</td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">{f.user_genotype}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">{f.traits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
