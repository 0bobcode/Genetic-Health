import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Dna, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer?.files[0] || e.target?.files?.[0]
    if (f) {
      setFile(f)
      setError('')
    }
  }, [])

  const onFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setError('')
    }
  }

  const submit = async () => {
    if (!file) return setError('Please select a genome file')
    setUploading(true)
    setError('')

    const form = new FormData()
    form.append('file', file)
    if (name.trim()) form.append('name', name.trim())

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { job_id } = await res.json()
      navigate(`/results/${job_id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Dna className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white tracking-tight">SequenceMe</h1>
          </div>
          <p className="text-slate-400 text-lg">Genetic health analysis from your 23andMe data</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Drop Zone */}
          <label
            className={`relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-indigo-400 bg-indigo-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-600 hover:border-indigo-500/50 hover:bg-white/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input type="file" className="hidden" accept=".txt,.csv,.tsv" onChange={onFileSelect} />
            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-300 font-medium">{file.name}</p>
                <p className="text-slate-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-300 font-medium">Drop your genome file here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse (.txt format)</p>
              </>
            )}
          </label>

          {/* Name Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-white/5 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={uploading || !file}
            className="mt-6 w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              'Analyze My Genome'
            )}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Your data is processed locally and never leaves your machine.
        </p>
      </div>
    </div>
  )
}
