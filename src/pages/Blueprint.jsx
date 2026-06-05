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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');
  
  const [members, setMembers] = useState([{ id: 1, value: "" }]);

  useEffect(() => {
    if (projectId) {
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
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
      // Reset for new project
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
      <div className="space-y-5 flex-1 overflow-y-auto pr-3 custom-scrollbar">
        {/* Title */}
        <div>
          <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Project Title:</label>
          {isEditing ? (
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
            />
          ) : (
            <div className="text-[15px] text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-transparent font-medium">{title || "Untitled Project"}</div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Description:</label>
          {isEditing ? (
            <textarea 
              rows={4} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors resize-none shadow-sm" 
            />
          ) : (
            <div className="text-[15px] text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-transparent min-h-[100px] whitespace-pre-wrap">{description || "No description."}</div>
          )}
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Tech Stack:</label>
          {isEditing && (
            <div className="flex gap-3 mb-2.5">
              <input 
                type="text" 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)} 
                onKeyDown={handleTechKeyDown}
                placeholder="Type tech and press enter"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
              />
              <select 
                onChange={e => {
                  if (e.target.value) {
                    handleAddTech(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-[130px] border border-gray-300 rounded-xl px-3 py-3 text-[15px] focus:outline-none focus:border-[#4A90E2] bg-white cursor-pointer shadow-sm"
              >
                <option value="">Presets...</option>
                {techOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2.5">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1.5 bg-[#4A90E2]/10 text-[#4A90E2] border border-[#4A90E2]/30 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                {t}
                {isEditing && (
                  <button onClick={() => removeTech(t)} className="hover:bg-[#4A90E2]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
            {techStack.length === 0 && !isEditing && (
              <span className="text-[15px] text-gray-500 italic">None specified</span>
            )}
          </div>
          {isEditing && <p className="text-[13.5px] font-medium text-[#4A90E2] mt-3">Select Tech Stack from list or type it and press Enter.</p>}
        </div>

        {/* Members */}
        <div>
          <label className="block text-[15px] font-semibold text-gray-800 mb-2">Members:</label>
          {isEditing ? (
            <div className="space-y-2.5 mb-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-[14px] text-[#4A90E2] font-semibold w-[130px] shrink-0">UserName/E-Mail:</span>
                  <input 
                    type="text" 
                    value={m.value} 
                    onChange={e => handleMemberChange(m.id, e.target.value)} 
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-colors shadow-sm" 
                  />
                  <button onClick={() => removeMember(m.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={addMember}
                className="w-full py-3 bg-[#4A90E2]/10 text-[#4A90E2] font-semibold text-[15px] rounded-xl hover:bg-[#4A90E2]/20 transition-colors flex items-center justify-center gap-2 border border-[#4A90E2]/30 mt-2 shadow-sm"
              >
                <Plus className="w-5 h-5" /> Add Member
              </button>
            </div>
          ) : (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-transparent">
              {members.filter(m => m.value.trim()).length > 0 ? (
                members.filter(m => m.value.trim()).map(m => (
                  <div key={m.id} className="text-[15px] text-gray-700 font-medium flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    {m.value}
                  </div>
                ))
              ) : (
                <div className="text-[15px] text-gray-500 italic">No members added</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 mt-6 flex gap-4 shrink-0">
        {isEditing ? (
          <>
            {viewState === 'centered' ? (
              <button onClick={() => navigate('/')} className="flex-1 py-3 bg-gray-100 text-gray-800 font-semibold text-[15px] rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
                Cancel
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 text-gray-800 font-semibold text-[15px] rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
                Cancel
              </button>
            )}
            {viewState === 'centered' ? (
              <button onClick={handleCreate} className="flex-1 py-3 bg-[#4A90E2] text-white font-semibold text-[15px] rounded-xl hover:bg-[#3D7EC8] transition-colors shadow-sm">
                Create
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-[#4A90E2] text-white font-semibold text-[15px] rounded-xl hover:bg-[#3D7EC8] transition-colors shadow-sm flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Save Changes
              </button>
            )}
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-gray-100 text-gray-800 font-semibold text-[15px] rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Edit2 className="w-5 h-5" /> Edit Details
          </button>
        )}
      </div>
    </>
  );

  const windowHeader = (
    <div className="bg-[#4A90E2] px-6 py-4 shrink-0 flex items-center justify-between text-white">
      <h2 className="text-[20px] font-bold tracking-wide">{projectId ? "Project Details" : "Create New Project"}</h2>
    </div>
  );

  if (viewState === 'centered') {
    return (
      <div className="p-8 h-[calc(100vh-64px)] flex flex-col page-enter">
        <div className="flex-1 flex items-center justify-center pb-12">
          <div className="w-[550px] min-w-[400px] max-w-full bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[85vh] transition-shadow resize-x overflow-hidden">
            {windowHeader}
            <div className="p-8 flex flex-col flex-1 overflow-hidden">
              {formContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex gap-8 page-enter bg-[#F8FAFC]">
      <div className="w-[450px] min-w-[350px] shrink-0 bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col h-full overflow-hidden transition-shadow resize-x">
        {windowHeader}
        <div className="p-8 flex flex-col flex-1 overflow-hidden">
          {formContent}
        </div>
      </div>
      <div className="flex-1 bg-[#121212] rounded-xl border border-gray-800 shadow-inner flex flex-col items-center justify-center text-gray-500 relative overflow-hidden transition-all duration-300">
        {/* Output window mock */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <p className="font-mono text-sm tracking-widest text-gray-600 uppercase">Output Window</p>
        <p className="text-xs text-gray-600 mt-2 opacity-50">Blueprint rendering will appear here.</p>
      </div>
    </div>
  );
}
