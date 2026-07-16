import { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position, useNodesState, useEdgesState } from '@xyflow/react';
import { Edit2, Lock, User, CheckSquare, X, ArrowRight, CornerDownRight, Activity, AlertCircle, HelpCircle } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { TaskNode, TrunkNode, DeveloperNode, SkillNode } from './workflow/Nodes';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const nodeTypes = {
  task: TaskNode,
  trunk: TrunkNode,
  developer: DeveloperNode,
  skill: SkillNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#475569', strokeWidth: 4 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#475569',
  },
};

const isAssignedToCurrentUser = (assignedTo, currentUser) => {
  if (!assignedTo || !currentUser) return false;
  const assignedLower = assignedTo.trim().toLowerCase();
  const currentUsername = (currentUser.username || '').trim().toLowerCase();
  const currentEmail = (currentUser.email || '').trim().toLowerCase();
  const currentGithub = (currentUser.github_username || '').trim().toLowerCase();
  const currentDiscord = (currentUser.discord_id || '').toString().trim().toLowerCase();
  
  return (
    assignedLower === currentUsername ||
    assignedLower === currentEmail ||
    assignedLower === currentGithub ||
    assignedLower === currentDiscord
  );
};

export function WorkflowCanvas({ projectId = "proj_marketing", tasksOverride = null, title = "" }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter States
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const { tasks: globalTasks, changeTaskStatus } = useProject();
  const { currentUser } = useAuth();
  const tasks = tasksOverride || globalTasks;

  const decodedId = decodeURIComponent(projectId || "").trim();
  
  // Filter tasks by project to extract lists and build nodes
  const projectTasks = (tasks || []).filter(t => {
    const pName = (t.project_id || "Project 1").trim();
    return pName === decodedId || pName === projectId;
  });

  // Sync selected task when backend task list is refreshed or updated
  useEffect(() => {
    if (selectedTask) {
      const updated = projectTasks.find(t => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
      }
    }
  }, [tasks]);

  const uniqueMembers = Array.from(new Set(projectTasks.map(t => t.assigned_to).filter(Boolean))).sort();
  const uniqueStatuses = Array.from(new Set(projectTasks.map(t => t.status).filter(Boolean))).sort();

  useEffect(() => {
    function loadTasks() {
      try {
        setLoading(true);
        if (!tasks || tasks.length === 0) {
           setNodes([]);
           setEdges([]);
           setLoading(false);
           return;
        }

        if (projectTasks.length === 0) {
           setNodes([]);
           setEdges([]);
           return;
        }

        // Build a map of task IDs to task objects for fast lookup
        const taskMap = {};
        projectTasks.forEach(t => {
          taskMap[t.id] = t;
        });

        // Build adjacency list for dependents (inverse of depends_on)
        const dependentsMap = {};
        projectTasks.forEach(t => {
          dependentsMap[t.id] = [];
        });
        projectTasks.forEach(t => {
          if (t.depends_on && t.depends_on.length > 0) {
            t.depends_on.forEach(depId => {
              if (dependentsMap[depId]) {
                dependentsMap[depId].push(t.id);
              }
            });
          }
        });

        // Memoized function to compute height of each task bottom-up
        const computedHeights = {};
        const visiting = new Set();

        function getTaskHeight(taskId) {
          if (computedHeights[taskId] !== undefined) {
            return computedHeights[taskId];
          }
          if (visiting.has(taskId)) {
            // Cycle detected, fallback to height 1
            return 1;
          }
          visiting.add(taskId);

          const deps = dependentsMap[taskId] || [];
          if (deps.length === 0) {
            visiting.delete(taskId);
            computedHeights[taskId] = 1;
            return 1;
          }

          let maxHeight = 0;
          deps.forEach(depId => {
            const h = getTaskHeight(depId);
            if (h > maxHeight) {
              maxHeight = h;
            }
          });

          visiting.delete(taskId);
          const height = 1 + maxHeight;
          computedHeights[taskId] = height;
          return height;
        }

        // Calculate heights for all project tasks and find the maximum height
        let maxProjectHeight = 1;
        projectTasks.forEach(t => {
          const h = getTaskHeight(t.id);
          if (h > maxProjectHeight) {
            maxProjectHeight = h;
          }
        });

        // Group tasks by their level: Level = maxProjectHeight - Height + 1
        const layers = {};
        projectTasks.forEach(t => {
          const height = computedHeights[t.id] || 1;
          const level = maxProjectHeight - height + 1;
          if (!layers[level]) layers[level] = [];
          layers[level].push(t);
        });

        const isFilterActive = selectedMembers.length > 0 || selectedStatuses.length > 0;
        const matchesFilter = (task) => {
          const memberMatch = selectedMembers.length === 0 || selectedMembers.includes(task.assigned_to);
          const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
          return memberMatch && statusMatch;
        };

        const newNodes = [];
        const newEdges = [];

        // Build Nodes
        Object.keys(layers).sort((a, b) => Number(a) - Number(b)).forEach((orderStr, layerIndex) => {
          const group = layers[orderStr];
          const yPosition = layerIndex * 220; // Vertical spacing between layers increased
          
          group.forEach((t, i) => {
            // Center the nodes horizontally.
            const xPosition = (i - (group.length - 1) / 2) * 350; // Horizontal spacing increased
            
            const matched = matchesFilter(t);
            newNodes.push({
              id: t.id,
              type: "task",
              position: { x: xPosition, y: yPosition },
              data: {
                label: t.title,
                status: t.status,
                assigned_to: t.assigned_to,
                project_name: t.project_id || "Project 1",
                isHighlighted: isFilterActive && matched,
                isDimmed: isFilterActive && !matched,
              }
            });
          });
        });

        // Build Edges based on depends_on
        const projectNodeIds = new Set(newNodes.map(n => n.id));
        
        projectTasks.forEach(t => {
          if (t.depends_on && t.depends_on.length > 0) {
            t.depends_on.forEach(dep => {
               // Only draw edges if the dependency is also in this project view
               if (projectNodeIds.has(dep) && projectNodeIds.has(t.id)) {
                 const sourceTask = taskMap[dep];
                 const targetTask = t;
                 const isSourceMatched = sourceTask ? matchesFilter(sourceTask) : false;
                 const isTargetMatched = matchesFilter(targetTask);

                 const isEdgeDimmed = isFilterActive && (!isSourceMatched || !isTargetMatched);

                 newEdges.push({
                   id: `e-${dep}-${t.id}`,
                   source: dep,
                   target: t.id,
                   type: "smoothstep",
                   style: { 
                     stroke: isEdgeDimmed ? '#cbd5e1' : '#475569', 
                     strokeWidth: isEdgeDimmed ? 1.5 : 4,
                     opacity: isEdgeDimmed ? 0.25 : 1,
                     transition: 'all 0.3s ease'
                   },
                   animated: !isEdgeDimmed && (t.status === 'in_progress')
                 });
               }
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error("Failed to load tasks for workflow graph", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [projectId, tasks, setNodes, setEdges, selectedMembers, selectedStatuses]);

  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    if (node.type !== 'task') return;
    
    // Workflow menu restriction: only allow status change if task is assigned to current logged-in user
    if (!isAssignedToCurrentUser(node.data?.assigned_to, currentUser)) {
      return;
    }

    setMenu({
      id: node.id,
      top: event.clientY,
      left: event.clientX,
    });
  };

  const onNodeClick = (event, node) => {
    console.log("[WorkflowCanvas] Click event fired for node:", node.id, "type:", node.type);
    if (node.type !== 'task') return;
    const task = projectTasks.find(t => t.id === node.id);
    console.log("[WorkflowCanvas] Found matching task:", task);
    if (task) {
      setSelectedTask(task);
    }
  };

  const closeMenu = () => setMenu(null);

  const handleStatusChange = async (status) => {
    if (!menu) return;
    const taskId = menu.id;
    
    // Optimistic UI update
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === taskId) {
          return { ...node, data: { ...node.data, status } };
        }
        return node;
      })
    );
    closeMenu();

    try {
      await changeTaskStatus(taskId, status);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const updateTaskStatusFromPanel = async (taskId, newStatus) => {
    // Optimistic UI updates
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === taskId) {
          return { ...node, data: { ...node.data, status: newStatus } };
        }
        return node;
      })
    );
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: newStatus } : prev);

    try {
      await changeTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to update status from panel", err);
    }
  };

  const taskDependencies = selectedTask 
    ? projectTasks.filter(t => selectedTask.depends_on?.includes(t.id))
    : [];

  const taskDependents = selectedTask
    ? projectTasks.filter(t => t.depends_on?.includes(selectedTask.id))
    : [];

  useEffect(() => {
    if (selectedTask) {
      const match = projectTasks.find(t => t.id === selectedTask.id);
      if (!match) {
        setSelectedTask(null);
      }
    }
  }, [projectId]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-[#F4F1EB] dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#27272A] text-gray-500 dark:text-white/50">Loading workflow...</div>;
  }

  const isFilterActive = selectedMembers.length > 0 || selectedStatuses.length > 0;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Workflow Filters Header area (outside the canvas border box) */}
      <div className="flex items-start gap-8 bg-transparent text-[#1D1E1B] dark:text-white/90 w-full flex-wrap md:flex-nowrap">
        {title && (
          <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold whitespace-nowrap pt-1">
            {title}
          </h1>
        )}

        <div className="flex flex-col gap-2 flex-1">
          {/* Member Checkbox List */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider min-w-[130px] flex items-center gap-1.5 select-none">
              <User className="w-3.5 h-3.5" /> Filter by Assignee:
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {uniqueMembers.length > 0 ? (
                uniqueMembers.map(member => {
                  const isChecked = selectedMembers.includes(member);
                  return (
                    <div
                      key={member}
                      onClick={() => {
                        setSelectedMembers(prev =>
                          isChecked ? prev.filter(m => m !== member) : [...prev, member]
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
                      <span className="text-xs font-medium text-gray-700 dark:text-white/80">{member}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 italic">No members found</span>
              )}
            </div>
          </div>

          {/* Status Checkbox List */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider min-w-[130px] flex items-center gap-1.5 select-none">
              <CheckSquare className="w-3.5 h-3.5" /> Filter by Status:
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {uniqueStatuses.length > 0 ? (
                uniqueStatuses.map(status => {
                  const isChecked = selectedStatuses.includes(status);
                  return (
                    <div
                      key={status}
                      onClick={() => {
                        setSelectedStatuses(prev =>
                          isChecked ? prev.filter(s => s !== status) : [...prev, status]
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
                      <span className="text-xs font-medium capitalize text-gray-700 dark:text-white/80">{status.replace('_', ' ')}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 italic">No statuses found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Flex layout supporting Canvas and Side Panel side-by-side */}
      <div className="flex-1 min-h-[600px] flex gap-4 relative">
        {/* Canvas Box */}
        <div className="flex-1 border border-gray-200 dark:border-[#27272A] rounded-xl bg-[#F4F1EB] dark:bg-[#09090B] shadow-sm overflow-hidden relative group">
          {/* Clear Filters Button inside top-right of canvas */}
          {isFilterActive && (
            <button 
              onClick={() => {
                setSelectedMembers([]);
                setSelectedStatuses([]);
              }}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-semibold transition-all bg-[#E74C3C] text-white hover:bg-[#C0392B] cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnDoubleClick={false}
            onNodeContextMenu={onNodeContextMenu}
            onNodeClick={onNodeClick}
            onPaneClick={closeMenu}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            proOptions={{ hideAttribution: true }}
          />

          {menu && (
            <div 
              className="fixed z-50 bg-[#6B905F] dark:bg-[#6B905F] rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px] text-sm overflow-hidden text-white"
              style={{ top: menu.top, left: menu.left }}
            >
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
                onClick={() => handleStatusChange('todo')}
              >
                Set Pending
              </button>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
                onClick={() => handleStatusChange('in_progress')}
              >
                Set In Progress
              </button>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
                onClick={() => handleStatusChange('completed')}
              >
                Set Completed
              </button>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#5A7A50] font-medium"
                onClick={() => handleStatusChange('stopped')}
              >
                Set Halted
              </button>
            </div>
          )}
        </div>

        {/* Side Details Panel */}
        {selectedTask && (
          <div className="w-[360px] shrink-0 border border-gray-200 dark:border-[#27272A] rounded-xl bg-white dark:bg-[#18181B] shadow-lg flex flex-col overflow-hidden transition-all duration-300 page-enter">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#27272A] flex items-center justify-between bg-gray-50 dark:bg-[#09090B] shrink-0 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {selectedTask.track || 'task'}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  selectedTask.priority === 'HIGH' 
                    ? 'bg-red-100 dark:bg-red-500/10 text-red-500 border border-red-500/20' 
                    : selectedTask.priority === 'MEDIUM'
                    ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                    : 'bg-blue-100 dark:bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {selectedTask.priority || 'MEDIUM'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Panel Contents */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Status Indicator & Title */}
              <div>
                <div className="flex items-center gap-2 mb-2 select-none">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedTask.status === 'completed'
                      ? 'bg-[#34D399]'
                      : selectedTask.status === 'in_progress'
                      ? 'bg-[#F59E42]'
                      : selectedTask.status === 'stopped'
                      ? 'bg-[#F87171]'
                      : 'bg-[#38BDF8]'
                  }`} />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                    {selectedTask.status === 'stopped' ? 'Halted' : selectedTask.status === 'in_progress' ? 'In Progress' : selectedTask.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
                <h2 className="text-[15px] font-bold text-[#1D1E1B] dark:text-white/90 leading-snug">
                  {selectedTask.title}
                </h2>
              </div>

              {/* Assignee Information */}
              <div className="flex items-center gap-3 bg-[#F4F1EB]/30 dark:bg-[#09090B]/30 p-2.5 rounded-lg border border-gray-100 dark:border-[#27272A]/50 select-none">
                <div className="w-8 h-8 rounded-full bg-[#6B905F]/10 dark:bg-[#6B905F]/20 flex items-center justify-center text-[#6B905F] font-bold text-sm shrink-0">
                  {selectedTask.assigned_to ? selectedTask.assigned_to[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Assigned To</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-white/80">{selectedTask.assigned_to || 'Unassigned'}</div>
                </div>
              </div>

              {/* Status Update Controls */}
              {isAssignedToCurrentUser(selectedTask.assigned_to, currentUser) && (
                <div className="pt-4 border-t border-gray-200 dark:border-[#27272A] space-y-3 select-none">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#6B905F]" />
                    <h3 className="text-[11px] font-bold text-[#6B905F] uppercase tracking-wider">
                      Update Task Status
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateTaskStatusFromPanel(selectedTask.id, 'todo')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        selectedTask.status === 'todo'
                          ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8] shadow-sm'
                          : 'bg-transparent border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3f3f46] text-gray-700 dark:text-white/80'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateTaskStatusFromPanel(selectedTask.id, 'in_progress')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        selectedTask.status === 'in_progress'
                          ? 'bg-[#F59E42]/10 text-[#F59E42] border-[#F59E42] shadow-sm'
                          : 'bg-transparent border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3f3f46] text-gray-700 dark:text-white/80'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateTaskStatusFromPanel(selectedTask.id, 'completed')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        selectedTask.status === 'completed'
                          ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399] shadow-sm'
                          : 'bg-transparent border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3f3f46] text-gray-700 dark:text-white/80'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => updateTaskStatusFromPanel(selectedTask.id, 'stopped')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        selectedTask.status === 'stopped'
                          ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171] shadow-sm'
                          : 'bg-transparent border-gray-200 dark:border-[#27272A] hover:border-gray-300 dark:hover:border-[#3f3f46] text-gray-700 dark:text-white/80'
                      }`}
                    >
                      Halted
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                  Description
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-[#F4F1EB]/10 dark:bg-[#09090B]/10 p-2.5 rounded-lg border border-transparent whitespace-pre-wrap">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              {/* Pre-requisites (Depends On) */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                  Pre-requisites (Depends On)
                </h3>
                <div className="space-y-1.5">
                  {taskDependencies.length > 0 ? (
                    taskDependencies.map(dep => (
                      <button
                        key={dep.id}
                        onClick={() => setSelectedTask(dep)}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 hover:bg-[#6B905F]/10 dark:bg-[#09090B]/50 dark:hover:bg-[#6B905F]/10 border border-gray-200 dark:border-[#27272A] hover:border-[#6B905F]/30 dark:hover:border-[#6B905F]/30 group transition-all"
                      >
                        <CornerDownRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6B905F] shrink-0" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                          {dep.title}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs italic text-gray-400 dark:text-gray-500 pl-2 select-none">No pre-requisites</div>
                  )}
                </div>
              </div>

              {/* Dependents (Blockers For) */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                  Blockers For (Dependents)
                </h3>
                <div className="space-y-1.5">
                  {taskDependents.length > 0 ? (
                    taskDependents.map(dep => (
                      <button
                        key={dep.id}
                        onClick={() => setSelectedTask(dep)}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 hover:bg-[#6B905F]/10 dark:bg-[#09090B]/50 dark:hover:bg-[#6B905F]/10 border border-gray-200 dark:border-[#27272A] hover:border-[#6B905F]/30 dark:hover:border-[#6B905F]/30 group transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6B905F] shrink-0" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                          {dep.title}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs italic text-gray-400 dark:text-gray-500 pl-2 select-none">No dependent tasks</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
