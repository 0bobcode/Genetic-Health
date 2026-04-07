import { AlertTriangle, ShieldCheck, Star } from 'lucide-react'

function Stars({ count }) {
  return (
    <span className="inline-flex gap-0.5">
      {[...Array(4)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
        />
      ))}
    </span>
  )
}

function VariantCard({ item, type }) {
  const trait = item.traits?.split(';')[0] || 'Unknown condition'
  const colors = {
    affected: 'border-red-500/20 bg-red-500/5',
    carrier: 'border-yellow-500/20 bg-yellow-500/5',
    het_unknown: 'border-orange-500/20 bg-orange-500/5',
  }

  return (
    <div className={`border rounded-xl p-4 ${colors[type] || 'border-white/10 bg-white/5'}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium">{item.gene || 'Unknown'}</h4>
        <Stars count={item.gold_stars || 0} />
      </div>
      <p className="text-slate-300 text-sm mb-2">{trait}</p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span>chr{item.chromosome}:{item.position}</span>
        <span className="font-mono px-1.5 py-0.5 bg-white/5 rounded">{item.user_genotype}</span>
        <span>{item.is_homozygous ? 'Homozygous' : 'Heterozygous'}</span>
      </div>
    </div>
  )
}

function RiskItem({ item }) {
  const trait = item.traits?.substring(0, 80) || 'Risk factor'
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/5 rounded-lg text-sm">
      <span className="text-white font-medium shrink-0">{item.gene || '—'}</span>
      <span className="text-slate-500 font-mono text-xs shrink-0">{item.rsid}</span>
      <span className="text-slate-400 truncate flex-1">{trait}</span>
      <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded shrink-0">{item.user_genotype}</span>
    </div>
  )
}

export default function DiseaseRisk({ disease }) {
  if (!disease) return <p className="text-slate-500">No disease data available.</p>

  const { affected, carriers, het_unknown, risk_factor, protective } = disease

  return (
    <div className="space-y-8">
      {/* Affected */}
      {affected?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Pathogenic Variants - Affected Status</h3>
          </div>
          <div className="grid gap-3">
            {affected.map((v, i) => <VariantCard key={i} item={v} type="affected" />)}
          </div>
        </section>
      )}

      {/* Carriers */}
      {carriers?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-white font-semibold">Carrier Status - Recessive Conditions</h3>
          </div>
          <p className="text-yellow-300/70 text-sm mb-4">You are a carrier -- no personal symptoms expected, but reproductive implications.</p>
          <div className="grid gap-3">
            {carriers.map((v, i) => <VariantCard key={i} item={v} type="carrier" />)}
          </div>
        </section>
      )}

      {/* Het Unknown */}
      {het_unknown?.length > 0 && (
        <section>
          <h3 className="text-white font-semibold mb-4">Pathogenic/Likely Pathogenic - Inheritance Unclear</h3>
          <div className="grid gap-3">
            {het_unknown.map((v, i) => <VariantCard key={i} item={v} type="het_unknown" />)}
          </div>
        </section>
      )}

      {/* Risk Factors */}
      {risk_factor?.length > 0 && (
        <section>
          <h3 className="text-white font-semibold mb-4">Risk Factor Variants ({risk_factor.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {risk_factor.slice(0, 30).map((v, i) => <RiskItem key={i} item={v} />)}
            {risk_factor.length > 30 && (
              <p className="text-slate-500 text-sm text-center py-2">...and {risk_factor.length - 30} more</p>
            )}
          </div>
        </section>
      )}

      {/* Protective */}
      {protective?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Protective Variants</h3>
          </div>
          <div className="space-y-2">
            {protective.map((v, i) => <RiskItem key={i} item={v} />)}
          </div>
        </section>
      )}

      {affected?.length === 0 && carriers?.length === 0 && het_unknown?.length === 0 && risk_factor?.length === 0 && (
        <p className="text-slate-500 text-center py-8">No significant disease variants detected.</p>
      )}
    </div>
  )
}
