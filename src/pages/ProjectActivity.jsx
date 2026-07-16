import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { MessageSquare, Activity, Clock, User } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const getDisplayActor = (event, allUsers) => {
  if (!event || !event.actor) return 'Unknown';
  const actorLower = event.actor.toLowerCase();

  // Find matching user from our platform
  const matchedUser = allUsers.find(u => {
    if (event.platform === 'github') {
      return u.github_username && u.github_username.toLowerCase() === actorLower;
    }
    if (event.platform === 'discord') {
      return u.discord_id && u.discord_id.toString().toLowerCase() === actorLower;
    }
    // Fallback/direct matching
    return (
      (u.username && u.username.toLowerCase() === actorLower) ||
      (u.github_username && u.github_username.toLowerCase() === actorLower) ||
      (u.discord_id && u.discord_id.toString().toLowerCase() === actorLower)
    );
  });

  return matchedUser ? matchedUser.username : event.actor;
};

const getActionSummary = (event, displayActor) => {
  if (!event.action_summary || !event.actor) return event.action_summary;
  return event.action_summary.replaceAll(event.actor, displayActor);
};

export default function ProjectActivity() {
  const { projectId } = useParams();
  const { projects, allUsers } = useProject();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const decodedId = decodeURIComponent(projectId || "").trim();
  const project = projects.find(p => p.id.trim() === decodedId || p.id === projectId);
  const projectName = project ? project.name : 'Project';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://orchestra-backend-30fy.onrender.com/events');
        const data = await response.json();
        if (data && data.events) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getPlatformIcon = (platform) => {
    if (platform === 'github') return <GithubIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    if (platform === 'discord') return <MessageSquare className="w-5 h-5 text-[#5865F2]" />;
    return <Activity className="w-5 h-5 text-gray-500" />;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).format(date);
  };

  // Enrich events with display actor names
  const enrichedEvents = events.map(event => {
    const displayActor = getDisplayActor(event, allUsers);
    return {
      ...event,
      displayActor,
      action_summary: getActionSummary(event, displayActor)
    };
  });

  const platforms = [...new Set(enrichedEvents.map(e => e.platform))].filter(Boolean);
  const users = [...new Set(enrichedEvents.map(e => e.displayActor))].filter(Boolean);

  const displayedEvents = enrichedEvents
    .filter(e => selectedPlatforms.length === 0 || selectedPlatforms.includes(e.platform))
    .filter(e => selectedUsers.length === 0 || selectedUsers.includes(e.displayActor))
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const isFilterActive = selectedPlatforms.length > 0 || selectedUsers.length > 0;

  return (
    <div className="w-full h-full flex flex-col pb-12">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} - Activity</h1>
        {isFilterActive && (
          <button
            onClick={() => {
              setSelectedPlatforms([]);
              setSelectedUsers([]);
            }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-950/30"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filters (Outside of the canvas box) */}
      <div className="flex flex-col gap-3.5 mb-6 p-1 bg-transparent text-[#1D1E1B] dark:text-white/90">
        
        {/* Sort Order Radio Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider min-w-[130px] flex items-center gap-1.5 select-none">
            <Clock className="w-3.5 h-3.5" /> Sort Order:
          </span>
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setSortOrder('desc')}
              className="flex items-center gap-2 cursor-pointer select-none group text-xs font-medium text-gray-700 dark:text-white/80"
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                sortOrder === 'desc' 
                  ? 'bg-[#6B905F] border-[#6B905F]' 
                  : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
              }`}>
                {sortOrder === 'desc' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              Newest First
            </div>
            <div 
              onClick={() => setSortOrder('asc')}
              className="flex items-center gap-2 cursor-pointer select-none group text-xs font-medium text-gray-700 dark:text-white/80"
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                sortOrder === 'asc' 
                  ? 'bg-[#6B905F] border-[#6B905F]' 
                  : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
              }`}>
                {sortOrder === 'asc' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              Oldest First
            </div>
          </div>
        </div>

        {/* Platform Checkbox List */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider min-w-[130px] flex items-center gap-1.5 select-none">
            <Activity className="w-3.5 h-3.5" /> Platforms:
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            {platforms.length > 0 ? (
              platforms.map(p => {
                const isChecked = selectedPlatforms.includes(p);
                return (
                  <div
                    key={p}
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        isChecked ? prev.filter(item => item !== p) : [...prev, p]
                      );
                    }}
                    className="flex items-center gap-2 cursor-pointer select-none group"
                  >
                    <div 
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-[#6B905F] border-[#6B905F]' 
                          : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                      }`}
                    >
                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-medium capitalize text-gray-700 dark:text-white/80">{p}</span>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-gray-400 italic">No platforms active</span>
            )}
          </div>
        </div>

        {/* User Checkbox List */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider min-w-[130px] flex items-center gap-1.5 select-none">
            <User className="w-3.5 h-3.5" /> Users:
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            {users.length > 0 ? (
              users.map(u => {
                const isChecked = selectedUsers.includes(u);
                return (
                  <div
                    key={u}
                    onClick={() => {
                      setSelectedUsers(prev =>
                        isChecked ? prev.filter(item => item !== u) : [...prev, u]
                      );
                    }}
                    className="flex items-center gap-2 cursor-pointer select-none group"
                  >
                    <div 
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-[#6B905F] border-[#6B905F]' 
                          : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                      }`}
                    >
                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-white/80">{u}</span>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-gray-400 italic">No users active</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-500">Loading activity feed...</div>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-[#F4F1EB] dark:bg-[#121910] rounded-xl border border-gray-200 dark:border-[#2B3B26]">
            <Activity className="w-8 h-8 mb-4 opacity-50" />
            <p>No activity events found for these filters.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-200 dark:border-[#2B3B26] ml-4 space-y-8">
            {displayedEvents.map((event) => (
              <div key={event.id} className="relative pl-8">
                {/* Timeline dot/icon */}
                <div className="absolute -left-[18px] bg-white dark:bg-[#0a100a] p-1 rounded-full border border-gray-200 dark:border-[#2B3B26] shadow-sm">
                  {getPlatformIcon(event.platform)}
                </div>

                {/* Event Card */}
                <div className="bg-[#F4F1EB] dark:bg-[#121910] border border-gray-200 dark:border-[#2B3B26] p-4 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-[#1D1E1B] dark:text-gray-200 text-base">
                      {event.action_summary}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.timestamp)}
                    </div>
                  </div>

                  {/* Badges/Metadata */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {event.platform}
                    </span>
                    {event.repo && (
                      <span className="px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                        repo: {event.repo}
                      </span>
                    )}
                    {event.channel && (
                      <span className="px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-300">
                        channel: #{event.channel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
