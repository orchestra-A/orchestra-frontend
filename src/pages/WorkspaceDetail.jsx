import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic mock data
  const details = {
    github: { name: 'GitHub', color: 'bg-slate-900', status: 'Connected', account: 'john-doe-dev' },
    discord: { name: 'Discord', color: 'bg-indigo-600', status: 'Connected', account: 'john#1234' },
    figma: { name: 'Figma', color: 'bg-pink-600', status: 'Not connected', account: null }
  };

  const platform = details[id] || { name: id, color: 'bg-gray-500', status: 'Unknown' };

  return (
    <div className="p-8 max-w-2xl page-enter">
      <button 
        onClick={() => navigate('/workspaces')}
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspaces
      </button>

      <div className="bg-white dark:bg-[#2A3142] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${platform.color}`}>
            {platform.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{platform.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${platform.status === 'Connected' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/30'}`}></span>
              <span className="text-sm text-slate-500 dark:text-white/60">{platform.status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-800 dark:text-white/90">Integration Settings</h3>
          
          <div className="p-4 bg-slate-50 dark:bg-[#22283A] rounded-lg">
            <p className="text-sm text-slate-600 dark:text-white/70 mb-1">Connected Account</p>
            <p className="text-base font-medium text-slate-900 dark:text-white">
              {platform.account ? platform.account : 'None'}
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              Disconnect Integration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
