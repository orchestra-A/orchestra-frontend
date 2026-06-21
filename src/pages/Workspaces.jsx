import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const platforms = [
  { id: 'github',  name: 'GitHub',  desc: 'Track commits, PRs and branch activity automatically.', color: 'bg-slate-900 text-white' },
  { id: 'discord', name: 'Discord', desc: 'Sync team channels for standup updates and notifications.', color: 'bg-indigo-600 text-white' },
  { id: 'figma',   name: 'Figma',   desc: 'Capture layout changes and design file updates live.', color: 'bg-pink-600 text-white' },
]

export default function Workspaces() {
  const navigate = useNavigate()
  const [connected, setConnected] = useState({ github: false, figma: false, discord: false })

  useEffect(() => {
    // Check if we have tokens/connections saved in localStorage (Mock)
    // In a real app, we'd fetch this from the backend
    setConnected({
      github: !!localStorage.getItem('authToken'),
      discord: !!localStorage.getItem('authToken'), // Simplified for demo
      figma: false
    })
  }, [])

  const handleConnect = (e, id) => {
    e.stopPropagation() // Prevent navigating to detail page
    // Redirect to the real backend OAuth endpoint
    if (id === 'figma') {
      alert("Figma integration coming soon!");
      return;
    }
    window.location.href = `https://orchestra-backend-2v5a.onrender.com/auth/${id}`;
  }

  const navigateToDetail = (id) => {
    navigate(`/workspaces/${id}`);
  }

  return (
    <div className="p-8 max-w-2xl page-enter">
      <div className="mb-8">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white">Connect workspaces</h2>
        <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Link your tools to start tracking activity automatically.</p>
      </div>

      <div className="flex flex-col gap-3">
        {platforms.map(p => (
          <div 
            key={p.id} 
            onClick={() => navigateToDetail(p.id)}
            className="flex items-center justify-between bg-[#6B905F] dark:bg-[#2B3B26] border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${p.color}`}>
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white/90">{p.name}</p>
                <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{p.desc}</p>
              </div>
            </div>
            <button
              onClick={(e) => handleConnect(e, p.id)}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                connected[p.id]
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-[#6B905F] dark:bg-[#6B905F]/5'
              }`}
            >
              {connected[p.id] ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-50 dark:bg-[#22283A] rounded-xl p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-white/50 mb-2">
          Active connections ({Object.values(connected).filter(Boolean).length}/3)
        </p>
        {Object.values(connected).some(Boolean)
          ? <p className="text-sm text-slate-600 dark:text-white/80">{platforms.filter(p => connected[p.id]).map(p => p.name).join(', ')} connected</p>
          : <p className="text-sm text-slate-400 dark:text-white/40">No workspaces connected yet.</p>
        }
      </div>
    </div>
  )
}
