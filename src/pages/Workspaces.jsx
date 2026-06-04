import { useState } from 'react'

const platforms = [
  { id: 'github',  name: 'GitHub',  desc: 'Track commits, PRs and branch activity automatically.', color: 'bg-slate-900 text-white' },
  { id: 'discord', name: 'Discord', desc: 'Sync team channels for standup updates and notifications.', color: 'bg-indigo-600 text-white' },
  { id: 'figma',   name: 'Figma',   desc: 'Capture layout changes and design file updates live.', color: 'bg-pink-600 text-white' },
]

export default function Workspaces() {
  const [connected, setConnected] = useState({})

  const toggle = (id) =>
    setConnected(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-8 max-w-2xl page-enter">
      <div className="mb-8">
        <h2 className="text-xl font-medium text-slate-800">Connect workspaces</h2>
        <p className="text-sm text-slate-500 mt-1">Link your tools to start tracking activity automatically.</p>
      </div>

      <div className="flex flex-col gap-3">
        {platforms.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${p.color}`}>
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(p.id)}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                connected[p.id]
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {connected[p.id] ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-50 rounded-xl p-5">
        <p className="text-xs font-medium text-slate-500 mb-2">
          Active connections ({Object.values(connected).filter(Boolean).length}/3)
        </p>
        {Object.values(connected).some(Boolean)
          ? <p className="text-sm text-slate-600">{Object.entries(connected).filter(([,v])=>v).map(([k])=>k).join(', ')} connected</p>
          : <p className="text-sm text-slate-400">No workspaces connected yet.</p>
        }
      </div>
    </div>
  )
}
