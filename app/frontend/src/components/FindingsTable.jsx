import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import ImpactBadge from './ImpactBadge'

export default function FindingsTable({ findings, byCategory }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(new Set(Object.keys(byCategory || {})))
  const [sortBy, setSortBy] = useState('magnitude')

  const categories = useMemo(() => {
    const cats = Object.entries(byCategory || {}).map(([name, items]) => {
      let filtered = items
      if (search) {
        const q = search.toLowerCase()
        filtered = items.filter(f =>
          f.gene.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.rsid.toLowerCase().includes(q)
        )
      }
      const sorted = [...filtered].sort((a, b) =>
        sortBy === 'magnitude' ? b.magnitude - a.magnitude :
        sortBy === 'gene' ? a.gene.localeCompare(b.gene) : 0
      )
      return { name, items: sorted, total: items.length }
    })
    return cats.filter(c => c.items.length > 0).sort((a, b) => b.items.length - a.items.length)
  }, [byCategory, search, sortBy])

  const toggle = (name) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by gene, rsID, or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="magnitude">Sort by Impact</option>
          <option value="gene">Sort by Gene</option>
        </select>
      </div>

      {/* Category Groups */}
      {categories.map(cat => (
        <div key={cat.name} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(cat.name)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              {expanded.has(cat.name) ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-white font-medium">{cat.name}</span>
              <span className="text-slate-500 text-sm">({cat.items.length})</span>
            </div>
          </button>

          {expanded.has(cat.name) && (
            <div className="border-t border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase">
                    <th className="text-left px-5 py-2 font-medium">Gene</th>
                    <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">rsID</th>
                    <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Genotype</th>
                    <th className="text-left px-3 py-2 font-medium">Description</th>
                    <th className="text-right px-5 py-2 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((f, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-white font-medium">{f.gene}</td>
                      <td className="px-3 py-3 text-slate-400 font-mono text-xs hidden sm:table-cell">{f.rsid}</td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono text-xs">{f.genotype}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-300 max-w-xs truncate">{f.description}</td>
                      <td className="px-5 py-3 text-right"><ImpactBadge magnitude={f.magnitude} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {categories.length === 0 && (
        <p className="text-slate-500 text-center py-8">No findings match your search.</p>
      )}
    </div>
  )
}
