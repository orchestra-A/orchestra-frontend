import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Check, Layout, FileText, Loader2, AlertCircle, ShieldAlert, GitBranch, MessageSquare, Archive } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { createBlueprint, validateTeamMembers, createProjectBackend, updateProjectBackend, createTaskBackend, fetchProjects } from '../services/api';

const techOptions = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Tailwind CSS', 'Next.js', 'PostgreSQL', 'MongoDB', 'Docker'];

// Blueprint Page Configuration
// Handles creation of new projects or editing existing projects' metadata (name, description, tech stack, team members).
export default function Blueprint() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, tasks, addProject, updateProject, refreshData } = useProject();
  const { currentUser } = useAuth();

  const currentUserId = currentUser?.user_id || currentUser?.id || currentUser?.username || currentUser?.email;

  // Local UI and Form States
  const [viewState, setViewState] = useState('centered');
  const [isEditing, setIsEditing] = useState(true);
  const [projectName, setProjectName] = useState('Project');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');

  const [members, setMembers] = useState([{ id: 1, value: "" }]);
  const [trackedRepos, setTrackedRepos] = useState([{ id: 1, value: "" }]);
  const [trackedChannels, setTrackedChannels] = useState([{ id: 1, value: "" }]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidatingUsers, setIsValidatingUsers] = useState(false);
  const [memberError, setMemberError] = useState(null);

  const [blueprintData, setBlueprintData] = useState(null);
  const [activeTab, setActiveTab] = useState('workflow');

  // Check if logged-in user is the creator of the selected project
  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const projectCreator = currentProject?.created_by || null;
  const isArchived = currentProject?.is_archived || false;

  const isCreator = !currentProject || !projectCreator || (
    currentUserId && (
      projectCreator.toLowerCase() === currentUserId.toString().toLowerCase() ||
      (currentUser?.username && projectCreator.toLowerCase() === currentUser.username.toLowerCase()) ||
      (currentUser?.email && projectCreator.toLowerCase() === currentUser.email.toLowerCase())
    )
  );

  useEffect(() => {
    if (projectId) {
      const proj = projects.find(p => p.id === projectId || p.name === projectId);
      if (proj) {
        setProjectName(proj.name || 'Project');
        setTitle(proj.name === 'Untitled Project' ? '' : proj.name);
        setDescription(proj.description === 'No description provided.' ? '' : proj.description);
        setTechStack(proj.techStack || []);

        if (proj.members && proj.members.length > 0) {
          setMembers(proj.members);
        } else {
          setMembers([{ id: 1, value: "" }]);
        }

        if (proj.tracked_repos && proj.tracked_repos.length > 0) {
          setTrackedRepos(proj.tracked_repos.map((val, i) => ({ id: i + 1, value: val })));
        } else {
          setTrackedRepos([{ id: 1, value: "" }]);
        }

        if (proj.tracked_channels && proj.tracked_channels.length > 0) {
          setTrackedChannels(proj.tracked_channels.map((val, i) => ({ id: i + 1, value: val })));
        } else {
          setTrackedChannels([{ id: 1, value: "" }]);
        }

        // Find associated tasks for this project to render in Workflow canvas & Description tab
        const projectTasks = tasks.filter(t => {
          const tid = (t.project_id || '').toLowerCase().trim();
          const pid = (proj.id || '').toLowerCase().trim();
          const pname = (proj.name || '').toLowerCase().trim();

          if (!tid) return false;
          if (tid === pid || tid === pname) return true;

          const cleanTid = tid.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanPid = pid.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');
          const cleanPname = pname.replace(/^proj[-_]/, '').replace(/[^a-z0-9]/g, '');

          return cleanTid && (cleanTid === cleanPid || cleanTid === cleanPname || cleanPid.includes(cleanTid) || cleanPname.includes(cleanTid));
        });

        setBlueprintData({
          summary: proj.summary
            ? proj.summary
            : (proj.description && proj.description !== 'No description provided.' ? proj.description : 'Project architecture and generated task breakdown.'),
          tasks: projectTasks,
          raw: null
        });

        setViewState('split');
        setIsEditing(false);
      }
    }
  }, [projectId, projects, tasks]);

  useEffect(() => {
    if (!projectId) {
      setTitle("");
      setDescription("");
      setTechStack([]);
      setMembers([{ id: 1, value: "" }]);
      setTrackedRepos([{ id: 1, value: "" }]);
      setTrackedChannels([{ id: 1, value: "" }]);
      setViewState('centered');
      setIsEditing(true);
      setMemberError(null);
    }
  }, [projectId]);

  const handleAddTech = (tech) => {
    const t = tech.trim();
    if (t && !techStack.includes(t)) {
      setTechStack([...techStack, t]);
    }
    setTechInput('');
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech(techInput);
    }
  };

  const removeTech = (t) => {
    setTechStack(techStack.filter(item => item !== t));
  };

  const handleMemberChange = (id, val) => {
    setMemberError(null);
    setMembers(members.map(m => m.id === id ? { ...m, value: val } : m));
  };

  const addMember = () => {
    setMemberError(null);
    setMembers([...members, { id: Date.now(), value: '' }]);
  };

  const removeMember = (id) => {
    setMemberError(null);
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    } else {
      setMembers([{ id: Date.now(), value: '' }]);
    }
  };

  const handleRepoChange = (id, val) => setTrackedRepos(trackedRepos.map(r => r.id === id ? { ...r, value: val } : r));
  const addRepo = () => setTrackedRepos([...trackedRepos, { id: Date.now(), value: '' }]);
  const removeRepo = (id) => {
    if (trackedRepos.length > 1) setTrackedRepos(trackedRepos.filter(r => r.id !== id));
    else setTrackedRepos([{ id: Date.now(), value: '' }]);
  };

  const handleChannelChange = (id, val) => setTrackedChannels(trackedChannels.map(c => c.id === id ? { ...c, value: val } : c));
  const addChannel = () => setTrackedChannels([...trackedChannels, { id: Date.now(), value: '' }]);
  const removeChannel = (id) => {
    if (trackedChannels.length > 1) setTrackedChannels(trackedChannels.filter(c => c.id !== id));
    else setTrackedChannels([{ id: Date.now(), value: '' }]);
  };

  const handleCreate = async () => {
    // If modifying an existing project, verify creator permissions
    if (projectId && !isCreator) {
      alert(`Only the project creator (${projectCreator}) is allowed to modify this project.`);
      return;
    }

    setMemberError(null);
    const rawMemberInputs = members.map(m => typeof m === 'string' ? m.trim() : (m.value || '').trim()).filter(Boolean);
    const rawRepoInputs = trackedRepos.map(r => typeof r === 'string' ? r.trim() : (r.value || '').trim()).filter(Boolean);
    const rawChannelInputs = trackedChannels.map(c => typeof c === 'string' ? c.trim() : (c.value || '').trim()).filter(Boolean);

    // Validate team user IDs against user table
    if (rawMemberInputs.length > 0) {
      setIsValidatingUsers(true);
      try {
        const validation = await validateTeamMembers(rawMemberInputs);
        if (!validation.valid) {
          const invalidFormatted = validation.invalidMembers.map(m => `"${m}"`).join(', ');
          const errorMsg = `User ID(s) not found in user table: ${invalidFormatted}. Please replace them with valid user IDs or remove them to proceed.`;
          setMemberError(errorMsg);
          alert(errorMsg);
          return;
        }
      } catch (err) {
        console.warn('User validation check warning:', err);
      } finally {
        setIsValidatingUsers(false);
      }
    }

    const payload = {
      name: title || 'Untitled Project',
      description: description || '',
      tech_stack: techStack,
      members: rawMemberInputs,
      tracked_repos: rawRepoInputs,
      tracked_channels: rawChannelInputs,
      created_by: currentUserId || null,
    };

    const isExistingBackendProject = projectId && projects.some(p => p.id === projectId && !p.id.startsWith('proj_'));

    if (isExistingBackendProject) {
      // Modifying existing verified backend project: Call POST /blueprint to regenerate blueprint & PATCH /projects/{project_id}
      setIsGenerating(true);
      setViewState('split');

      try {
        // 1. Call POST /blueprint with new changes
        const blueprintRes = await createBlueprint(payload, currentUserId);
        const tasksList = blueprintRes.tasks || [];
        const summaryContent = blueprintRes.summary || blueprintRes.description || (typeof blueprintRes === 'string' ? blueprintRes : "Updated blueprint.");

        setBlueprintData({
          tasks: tasksList,
          summary: summaryContent,
          raw: blueprintRes
        });

        // 2. Call PATCH /projects/{project_id} to update project table in backend
        try {
          await updateProjectBackend(projectId, { ...payload, summary: summaryContent });
        } catch (patchErr) {
          console.warn('[Blueprint] Backend project update error:', patchErr);
        }

        // Note: We don't need to manually create tasks here.
        // The POST /blueprint endpoint on the backend automatically handles
        // updating the database with the newly generated tasks.
        // 4. Update local project context
        updateProject(projectId, { title, description, members, techStack });
      } catch (err) {
        console.error('Failed to update blueprint & project:', err);
        setBlueprintData({
          tasks: [],
          summary: `Failed to update blueprint: ${err.message}`,
          raw: null
        });
      } finally {
        setIsGenerating(false);
        setIsEditing(false);
      }
    } else {
      // Creating new project: Call POST /blueprint (backend handles creating project and tasks in DB)
      setIsGenerating(true);
      setViewState('split');

      try {
        // 1. Call POST /blueprint (Backend creates project record & tasks directly in database)
        const data = await createBlueprint(payload, currentUserId);
        console.log('[Blueprint] POST /blueprint server response:', data);

        const tasksList = data.tasks || [];
        const summaryContent = data.summary || data.description || (typeof data === 'string' ? data : "Blueprint project generated successfully.");

        setBlueprintData({
          tasks: tasksList,
          summary: summaryContent,
          raw: data
        });

        // Extract real canonical DB project ID returned from POST /blueprint
        let realDbProjectId = null;
        if (typeof data === 'string') {
          realDbProjectId = data;
        } else if (data && typeof data === 'object') {
          realDbProjectId =
            data.project_id ||
            data.id ||
            data.project?.id ||
            data.project?.project_id ||
            data.data?.id ||
            data.data?.project_id;
        }

        // Fallback: If POST /blueprint didn't return explicit ID at root, fetch latest project list to find the DB primary key
        if (!realDbProjectId) {
          try {
            const fetched = await fetchProjects();
            const matches = fetched.filter(p => (p.name || p.title || '').toLowerCase() === (title || '').toLowerCase());
            if (matches.length > 0) {
              const matched = matches[matches.length - 1];
              realDbProjectId = matched.project_id || matched.id;
            }
          } catch (fErr) {
            console.warn('[Blueprint] Fallback project ID fetch error:', fErr);
          }
        }

        const finalProjectId = realDbProjectId || `proj_${Date.now()}`;
        console.log('[Blueprint] Real DB project ID from blueprint creation:', finalProjectId);

        // Note: We don't need to manually create tasks here.
        // The POST /blueprint endpoint on the backend automatically handles
        // saving the initial generated tasks to the database.
        // Add to local state/context
        addProject(
          { id: finalProjectId, title, description, members, techStack },
          currentUserId
        );

        // Refresh global projects and tasks from backend so tasks appear immediately
        if (refreshData) {
          await refreshData().catch(() => { });
        }

        navigate(`/blueprint/${finalProjectId}`, { replace: true });
      } catch (err) {
        console.error('Failed to generate blueprint from backend:', err);
        setBlueprintData({
          tasks: [],
          summary: `Failed to load blueprint details: ${err.message}`,
          raw: null
        });
      } finally {
        setIsGenerating(false);
        setIsEditing(false);
      }
    }
  };

  const formContent = (
    <>
      <div className="space-y-4 flex-1 pr-2">
        {isArchived && (
          <div className="p-2.5 bg-gray-100 dark:bg-[#1E1E22] border border-gray-300 dark:border-[#27272A] rounded-md flex items-start gap-2 text-gray-700 dark:text-gray-300 text-[11px] mb-2 font-medium">
            <Archive className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
            <span>This project is archived and locked from further edits.</span>
          </div>
        )}

        {projectId && !isCreator && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md flex items-start gap-2 text-amber-700 dark:text-amber-300 text-[11px] mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>Modify controls are only accessible to the project creator ({projectCreator || 'another user'}).</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Project Title:</label>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors shadow-sm"
            />
          ) : (
            <div className="text-[12px] text-[#1D1E1B] dark:text-white/90 bg-[#F3F7F1] dark:bg-[#18181B] px-2 py-1 rounded-md border border-transparent font-medium">{title || "Untitled Project"}</div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description:</label>
          {isEditing ? (
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors resize-none shadow-sm"
            />
          ) : (
            <div className="text-[12px] text-gray-700 dark:text-white/80 bg-[#F3F7F1] dark:bg-[#18181B] px-2 py-1 rounded-md border border-transparent min-h-[36px] whitespace-pre-wrap">{description || "No description."}</div>
          )}
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tech Stack:</label>
          {isEditing && (
            <div className="flex gap-1.5 mb-1.5">
              <input
                type="text"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Type tech and press enter"
                className="flex-1 bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors shadow-sm"
              />
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleAddTech(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-[100px] bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-200 dark:border-[#27272A] rounded-lg px-2 py-2.5 text-[12px] focus:outline-none focus:border-[#6B905F] dark:focus:border-[#6B905F] focus:ring-2 focus:ring-[#6B905F]/20 dark:focus:ring-[#6B905F]/20 cursor-pointer shadow-sm"
              >
                <option value="">Presets...</option>
                {techOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1 bg-[#6B905F]/10 dark:bg-[#6B905F]/10 text-[#6B905F] dark:text-[#6B905F] border border-[#6B905F]/30 dark:border-[#6B905F]/30 px-1.5 py-0.5 rounded text-[11px] font-semibold shadow-sm">
                {t}
                {isEditing && (
                  <button onClick={() => removeTech(t)} className="hover:bg-[#6B905F] dark:bg-[#6B905F]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </span>
            ))}
            {techStack.length === 0 && !isEditing && (
              <span className="text-[11px] text-gray-500 dark:text-white/50 italic">None specified</span>
            )}
          </div>
        </div>

        {/* Members */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Members:</label>
          {memberError && (
            <div className="mb-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-md flex items-start gap-2 text-red-600 dark:text-red-400 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{memberError}</span>
            </div>
          )}
          {isEditing ? (
            <div className="space-y-1 mb-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#6B905F] dark:text-[#6B905F] font-semibold w-[80px] shrink-0">User/E-Mail:</span>
                  <input
                    type="text"
                    value={typeof m === 'string' ? m : (m?.value || '')}
                    onChange={e => handleMemberChange(m.id || m, e.target.value)}
                    placeholder="Enter user_id or email"
                    className="flex-1 bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors shadow-sm"
                  />
                  <button onClick={() => removeMember(m.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-md transition-colors shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addMember}
                className="w-full py-1 bg-[#6B905F]/10 dark:bg-[#6B905F]/10 text-[#6B905F] dark:text-[#6B905F] font-semibold text-[11px] rounded-md hover:bg-[#6B905F]/20 dark:hover:bg-[#6B905F]/20 transition-colors flex items-center justify-center gap-1 border border-[#6B905F]/30 dark:border-[#6B905F]/30 mt-1 shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add Member
              </button>
            </div>
          ) : (
            <div className="space-y-1 bg-[#F3F7F1] dark:bg-[#18181B] p-2 rounded-md border border-transparent">
              {members.filter(m => (typeof m === 'string' ? m : (m?.value || '')).trim()).length > 0 ? (
                members.filter(m => (typeof m === 'string' ? m : (m?.value || '')).trim()).map((m, idx) => {
                  const val = typeof m === 'string' ? m : (m?.value || '');
                  return (
                    <div key={typeof m === 'object' ? (m.id || idx) : idx} className="text-[12px] text-gray-700 dark:text-white/90 font-medium flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      {val}
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-gray-500 dark:text-white/50 italic">No members added</div>
              )}
            </div>
          )}
        </div>

        {/* Tracked Repos */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tracked Repos:</label>
          {isEditing ? (
            <div className="space-y-1 mb-1">
              {trackedRepos.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#6B905F] dark:text-[#6B905F] font-semibold w-[80px] shrink-0"><GitBranch className="w-3 h-3 inline mr-1" />Repo URL:</span>
                  <input
                    type="text"
                    value={typeof r === 'string' ? r : (r?.value || '')}
                    onChange={e => handleRepoChange(r.id || r, e.target.value)}
                    placeholder="Enter repository URL"
                    className="flex-1 bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors shadow-sm"
                  />
                  <button onClick={() => removeRepo(r.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-md transition-colors shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addRepo}
                className="w-full py-1 bg-[#6B905F]/10 dark:bg-[#6B905F]/10 text-[#6B905F] dark:text-[#6B905F] font-semibold text-[11px] rounded-md hover:bg-[#6B905F]/20 dark:hover:bg-[#6B905F]/20 transition-colors flex items-center justify-center gap-1 border border-[#6B905F]/30 dark:border-[#6B905F]/30 mt-1 shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add Repo
              </button>
            </div>
          ) : (
            <div className="space-y-1 bg-[#F3F7F1] dark:bg-[#18181B] p-2 rounded-md border border-transparent">
              {trackedRepos.filter(r => (typeof r === 'string' ? r : (r?.value || '')).trim()).length > 0 ? (
                trackedRepos.filter(r => (typeof r === 'string' ? r : (r?.value || '')).trim()).map((r, idx) => {
                  const val = typeof r === 'string' ? r : (r?.value || '');
                  return (
                    <div key={typeof r === 'object' ? (r.id || idx) : idx} className="text-[12px] text-gray-700 dark:text-white/90 font-medium flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      {val}
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-gray-500 dark:text-white/50 italic">No tracked repos</div>
              )}
            </div>
          )}
        </div>

        {/* Tracked Channels */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tracked Channels:</label>
          {isEditing ? (
            <div className="space-y-1 mb-1">
              {trackedChannels.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#6B905F] dark:text-[#6B905F] font-semibold w-[80px] shrink-0"><MessageSquare className="w-3 h-3 inline mr-1" />Channel ID:</span>
                  <input
                    type="text"
                    value={typeof c === 'string' ? c : (c?.value || '')}
                    onChange={e => handleChannelChange(c.id || c, e.target.value)}
                    placeholder="Enter channel ID"
                    className="flex-1 bg-white dark:bg-[#18181B] text-[#1D1E1B] dark:text-white/90 border border-gray-300 dark:border-[#27272A] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#6B905F] dark:border-[#6B905F] focus:ring-1 focus:ring-[#6B905F] dark:ring-[#6B905F] transition-colors shadow-sm"
                  />
                  <button onClick={() => removeChannel(c.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-md transition-colors shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addChannel}
                className="w-full py-1 bg-[#6B905F]/10 dark:bg-[#6B905F]/10 text-[#6B905F] dark:text-[#6B905F] font-semibold text-[11px] rounded-md hover:bg-[#6B905F]/20 dark:hover:bg-[#6B905F]/20 transition-colors flex items-center justify-center gap-1 border border-[#6B905F]/30 dark:border-[#6B905F]/30 mt-1 shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add Channel
              </button>
            </div>
          ) : (
            <div className="space-y-1 bg-[#F3F7F1] dark:bg-[#18181B] p-2 rounded-md border border-transparent">
              {trackedChannels.filter(c => (typeof c === 'string' ? c : (c?.value || '')).trim()).length > 0 ? (
                trackedChannels.filter(c => (typeof c === 'string' ? c : (c?.value || '')).trim()).map((c, idx) => {
                  const val = typeof c === 'string' ? c : (c?.value || '');
                  return (
                    <div key={typeof c === 'object' ? (c.id || idx) : idx} className="text-[12px] text-gray-700 dark:text-white/90 font-medium flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      {val}
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-gray-500 dark:text-white/50 italic">No tracked channels</div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-[#27272A] mt-2 flex gap-2 shrink-0">
        {isEditing ? (
          <>
            <button onClick={() => viewState === 'centered' ? navigate('/') : setIsEditing(false)} className="flex-1 py-2.5 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] text-gray-700 dark:text-white/80 font-semibold text-[14px] rounded-xl hover:bg-gray-50 dark:hover:bg-[#27272A] hover:text-gray-900 dark:hover:text-white transition-all shadow-sm">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isValidatingUsers || isGenerating}
              className="flex-1 py-1.5 bg-[#6B905F] dark:bg-[#6B905F] text-white font-semibold text-[13px] rounded-md hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isValidatingUsers ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Validating...</>
              ) : viewState === 'centered' ? (
                "Create"
              ) : (
                <><Check className="w-3.5 h-3.5" /> Save</>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              if (isArchived) {
                alert(`This project is archived and cannot be edited.`);
                return;
              }
              if (!isCreator) {
                alert(`Modify controls are only accessible to the project creator (${projectCreator || 'another user'}).`);
                return;
              }
              setIsEditing(true);
            }}
            disabled={!isCreator || isArchived}
            title={isArchived ? 'Project is archived and locked' : !isCreator ? `Only project creator (${projectCreator}) can modify details` : 'Edit Project Details'}
            className="w-full py-2.5 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] text-gray-800 dark:text-white/90 font-semibold text-[14px] rounded-xl hover:bg-gray-50 dark:hover:bg-[#27272A] transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Details
          </button>
        )}
      </div>
    </>
  );

  const windowHeader = (
    <div className="bg-[#6B905F] dark:bg-[#6B905F] px-3 py-1.5 shrink-0 flex items-center justify-between text-white rounded-t-xl">
      <h2 className="text-[13px] font-bold tracking-wide">{projectId ? "Project Details" : "Create New Project"}</h2>
    </div>
  );

  const pageHeading = (
    <div className="mb-4 shrink-0">
      <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">
        {projectId ? `${projectName} - Modify` : "Create New Project"}
      </h1>
    </div>
  );

  if (viewState === 'centered') {
    return (
      <div className="h-full page-enter bg-[#F8F9FA] dark:bg-black/40 overflow-y-auto custom-scrollbar">
        <div className="min-h-full py-6 px-4 flex items-center justify-center">
          <div className="w-[700px] max-w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/60 dark:border-[#27272A] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col transition-shadow">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-[#27272A] flex flex-col shrink-0 bg-white dark:bg-[#121212] rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90 tracking-tight">{projectId ? "Project Details" : "Create New Project"}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projectId ? "View and modify your project settings" : "Set up a new workspace for your team"}</p>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col bg-white dark:bg-[#121212] rounded-b-2xl">
              {formContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex gap-4 md:gap-5 page-enter bg-transparent pb-4">
      <div className="w-[320px] lg:w-[350px] shrink-0 flex flex-col h-full overflow-hidden resize-x">
        {pageHeading}
        <div className="flex-1 bg-[#F4F1EB] dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#27272A] shadow-lg flex flex-col overflow-hidden transition-shadow">
          {windowHeader}
          <div className="p-3 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            {formContent}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-[#F4F1EB] dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#27272A] shadow-lg flex flex-col relative overflow-hidden transition-all duration-300">

        {/* Header & Tabs */}
        <div className="bg-white dark:bg-[#18181B] border-b border-gray-200 dark:border-[#27272A] px-4 py-3 flex items-center justify-between shrink-0 z-10">
          <div className="flex bg-gray-100 dark:bg-[#09090B] rounded-lg p-1 border border-gray-200 dark:border-[#27272A]">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${activeTab === 'workflow' ? 'bg-white dark:bg-[#27272A] text-[#6B905F] dark:text-[#6B905F] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Layout className="w-3.5 h-3.5" /> Workflow
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${activeTab === 'description' ? 'bg-white dark:bg-[#27272A] text-[#6B905F] dark:text-[#6B905F] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
          </div>

          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#6B905F] mb-3" />
              <p className="font-semibold text-[13px]">Generating Blueprint...</p>
              <p className="text-[11px] mt-1 opacity-70">Structuring workflow and compiling details</p>
            </div>
          ) : blueprintData ? (
            activeTab === 'workflow' ? (
              <WorkflowCanvas projectId={projectId} tasksOverride={blueprintData.tasks} />
            ) : (
              <div className="p-6 overflow-y-auto w-full h-full custom-scrollbar space-y-6">
                <div className="max-w-3xl space-y-5">
                  {/* Summary Card at the Beginning */}
                  {blueprintData.summary && (
                    <div className="bg-[#6B905F]/10 dark:bg-[#6B905F]/15 border border-[#6B905F]/30 p-4 rounded-xl shadow-sm">
                      <h3 className="text-xs font-bold text-[#6B905F] dark:text-[#6B905F] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Project Summary
                      </h3>
                      <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {blueprintData.summary}
                      </p>
                    </div>
                  )}

                  {/* Task List Architecture */}
                  {blueprintData.tasks && blueprintData.tasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Task & Workflow Breakdown ({blueprintData.tasks.length} Tasks)
                      </h3>
                      <div className="grid gap-3">
                        {blueprintData.tasks.map((t, idx) => (
                          <div key={t.id || idx} className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-3.5 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#6B905F] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                                  {t.id || `T${idx + 1}`}
                                </span>
                                <span className="font-semibold text-[13px] text-gray-900 dark:text-white">
                                  {t.title}
                                </span>
                              </div>
                              {t.track && (
                                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-[#27272A] px-2 py-0.5 rounded">
                                  {t.track}
                                </span>
                              )}
                            </div>
                            {t.description && (
                              <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">
                                {t.description}
                              </p>
                            )}
                            {t.assigned_to && (
                              <div className="mt-2 text-[11px] text-[#6B905F] font-medium flex items-center gap-1">
                                <span>Assigned to:</span>
                                <span className="font-semibold">{t.assigned_to}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Layout className="w-12 h-12 opacity-20 mb-3" />
              <p className="font-mono text-[12px] tracking-widest uppercase">Output Window</p>
              <p className="text-[11px] mt-1 opacity-60">Blueprint rendering will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
