import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

const techOptions = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Tailwind CSS', 'Next.js', 'PostgreSQL', 'MongoDB', 'Docker'];

export default function Blueprint() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, addProject, updateProject } = useProject();
  const [viewState, setViewState] = useState('centered');
  const [isEditing, setIsEditing] = useState(true);
  const [projectName, setProjectName] = useState('Project');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');
  
  const [members, setMembers] = useState([{ id: 1, value: "" }]);

  useEffect(() => {
    if (projectId) {
      const proj = projects.find(p => p.id === projectId);
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
        
        setViewState('split');
        setIsEditing(false);
      }
    }
  }, [projectId, projects]);

  useEffect(() => {
    if (!projectId) {
      setTitle("");
      setDescription("");
      setTechStack([]);
      setMembers([{ id: 1, value: "" }]);
      setViewState('centered');
      setIsEditing(true);
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
    setMembers(members.map(m => m.id === id ? { ...m, value: val } : m));
  };

  const addMember = () => {
    setMembers([...members, { id: Date.now(), value: '' }]);
  };

  const removeMember = (id) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    } else {
      setMembers([{ id: Date.now(), value: '' }]);
    }
  };

  const handleCreate = () => {
    if (projectId) {
      updateProject(projectId, { title, description, members, techStack });
      setViewState('split');
      setIsEditing(false);
    } else {
      const newId = addProject({ title, description, members, techStack });
      navigate(`/blueprint/${newId}`);
    }
  };

  const formContent = (
    <>
      <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-800 dark:text-gray-300 mb-0.5">Project Title:</label>
          {isEditing ? (
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-white dark:bg-[#141824] text-gray-900 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
            />
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white/90 bg-gray-50 dark:bg-[#141824] px-2 py-1 rounded-md border border-transparent font-medium">{title || "Untitled Project"}</div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-800 dark:text-gray-300 mb-0.5">Description:</label>
          {isEditing ? (
            <textarea 
              rows={2} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-white dark:bg-[#141824] text-gray-900 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors resize-none shadow-sm" 
            />
          ) : (
            <div className="text-[12px] text-gray-700 dark:text-white/80 bg-gray-50 dark:bg-[#141824] px-2 py-1 rounded-md border border-transparent min-h-[36px] whitespace-pre-wrap">{description || "No description."}</div>
          )}
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-800 dark:text-gray-300 mb-0.5">Tech Stack:</label>
          {isEditing && (
            <div className="flex gap-1.5 mb-1.5">
              <input 
                type="text" 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)} 
                onKeyDown={handleTechKeyDown}
                placeholder="Type tech and press enter"
                className="flex-1 bg-white dark:bg-[#141824] text-gray-900 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
              />
              <select 
                onChange={e => {
                  if (e.target.value) {
                    handleAddTech(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-[90px] bg-white dark:bg-[#141824] text-gray-900 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] rounded-md px-1 py-1 text-[11px] focus:outline-none focus:border-[#4A90E2] cursor-pointer shadow-sm"
              >
                <option value="">Presets...</option>
                {techOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1 bg-[#4A90E2]/10 text-[#4A90E2] border border-[#4A90E2]/30 px-1.5 py-0.5 rounded text-[11px] font-semibold shadow-sm">
                {t}
                {isEditing && (
                  <button onClick={() => removeTech(t)} className="hover:bg-[#4A90E2]/20 rounded-full p-0.5 transition-colors">
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
          <label className="block text-[11px] font-semibold text-gray-800 dark:text-gray-300 mb-0.5">Members:</label>
          {isEditing ? (
            <div className="space-y-1 mb-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#4A90E2] font-semibold w-[80px] shrink-0">User/E-Mail:</span>
                  <input 
                    type="text" 
                    value={m.value} 
                    onChange={e => handleMemberChange(m.id, e.target.value)} 
                    className="flex-1 bg-white dark:bg-[#141824] text-gray-900 dark:text-white/90 border border-gray-300 dark:border-[#2A3142] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
                  />
                  <button onClick={() => removeMember(m.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-md transition-colors shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={addMember}
                className="w-full py-1 bg-[#4A90E2]/10 text-[#4A90E2] font-semibold text-[11px] rounded-md hover:bg-[#4A90E2]/20 transition-colors flex items-center justify-center gap-1 border border-[#4A90E2]/30 mt-1 shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add Member
              </button>
            </div>
          ) : (
            <div className="space-y-1 bg-gray-50 dark:bg-[#141824] p-2 rounded-md border border-transparent">
              {members.filter(m => m.value.trim()).length > 0 ? (
                members.filter(m => m.value.trim()).map(m => (
                  <div key={m.id} className="text-[12px] text-gray-700 dark:text-white/90 font-medium flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                    {m.value}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-gray-500 dark:text-white/50 italic">No members added</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-[#2A3142] mt-2 flex gap-2 shrink-0">
        {isEditing ? (
          <>
            <button onClick={() => viewState === 'centered' ? navigate('/') : setIsEditing(false)} className="flex-1 py-1.5 bg-white dark:bg-[#1A1E2E] border border-gray-300 dark:border-[#2A3142] text-gray-800 dark:text-white/90 font-semibold text-[13px] rounded-md hover:bg-gray-50 dark:hover:bg-[#2A3142] transition-colors shadow-sm">
              Cancel
            </button>
            <button onClick={handleCreate} className="flex-1 py-1.5 bg-[#4A90E2] text-white font-semibold text-[13px] rounded-md hover:bg-[#3D7EC8] transition-colors shadow-sm flex items-center justify-center gap-1.5">
              {viewState === 'centered' ? "Create" : <><Check className="w-3.5 h-3.5" /> Save</>}
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="w-full py-1.5 bg-white dark:bg-[#1A1E2E] border border-gray-300 dark:border-[#2A3142] text-gray-800 dark:text-white/90 font-semibold text-[13px] rounded-md hover:bg-gray-50 dark:hover:bg-[#2A3142] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <Edit2 className="w-3.5 h-3.5" /> Edit Details
          </button>
        )}
      </div>
    </>
  );

  const windowHeader = (
    <div className="bg-[#4A90E2] px-3 py-1.5 shrink-0 flex items-center justify-between text-white rounded-t-xl">
      <h2 className="text-[13px] font-bold tracking-wide">{projectId ? "Project Details" : "Create New Project"}</h2>
    </div>
  );

  const pageHeading = (
    <div className="mb-4 shrink-0">
      <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">
        {projectId ? `${projectName} - Modify` : "Create New Project"}
      </h1>
    </div>
  );

  if (viewState === 'centered') {
    return (
      <div className="h-full flex flex-col page-enter">
        <div className="flex-1 flex items-center justify-center pb-4 min-h-0">
          <div className="w-[800px] max-w-[95%] bg-white dark:bg-[#1A1E2E] rounded-xl border border-gray-200 dark:border-[#2A3142] shadow-2xl flex flex-col max-h-[95%] transition-shadow overflow-hidden">
            {windowHeader}
            <div className="p-5 flex flex-col flex-1 overflow-hidden">
              {formContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col page-enter bg-transparent">
      {pageHeading}
      <div className="flex-1 flex gap-4 md:gap-5 min-h-0 pb-4">
        <div className="w-[320px] lg:w-[350px] shrink-0 bg-white dark:bg-[#1A1E2E] rounded-xl border border-gray-200 dark:border-[#2A3142] shadow-lg flex flex-col h-full overflow-hidden transition-shadow resize-x">
          {windowHeader}
          <div className="p-3 flex flex-col flex-1 overflow-hidden">
            {formContent}
          </div>
        </div>
        <div className="flex-1 bg-[#121212] rounded-xl border border-gray-800 shadow-inner flex flex-col items-center justify-center text-gray-500 dark:text-white/50 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <p className="font-mono text-[12px] tracking-widest text-gray-600 uppercase">Output Window</p>
        <p className="text-[10px] text-gray-600 mt-1 opacity-50">Blueprint rendering will appear here.</p>
        </div>
      </div>
    </div>
  );
}
