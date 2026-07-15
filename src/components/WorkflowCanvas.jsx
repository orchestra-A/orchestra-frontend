import { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position, useNodesState, useEdgesState } from '@xyflow/react';
import { Edit2, Lock, User, CheckSquare } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { TaskNode, TrunkNode, DeveloperNode, SkillNode } from './workflow/Nodes';
import { useProject } from '../context/ProjectContext';

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

export function WorkflowCanvas({ projectId = "proj_marketing", tasksOverride = null, title = "" }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  // Filter States
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const { tasks: globalTasks } = useProject();
  const tasks = tasksOverride || globalTasks;

  const decodedId = decodeURIComponent(projectId || "").trim();
  
  // Filter tasks by project to extract lists and build nodes
  const projectTasks = (tasks || []).filter(t => {
    const pName = (t.project_id || "Project 1").trim();
    return pName === decodedId || pName === projectId;
  });

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
    
    setMenu({
      id: node.id,
      top: event.clientY,
      left: event.clientX,
    });
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
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

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

      {/* Main Workflow Canvas Box */}
      <div className="flex-1 min-h-[600px] border border-gray-200 dark:border-[#27272A] rounded-xl bg-[#F4F1EB] dark:bg-[#09090B] shadow-sm overflow-hidden relative group">
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
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={closeMenu}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
        />

        {menu && (
          <div 
            className="fixed z-50 bg-[#6B905F] dark:bg-[#6B905F] rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px] text-sm overflow-hidden"
            style={{ top: menu.top, left: menu.left }}
          >
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium"
              onClick={() => handleStatusChange('todo')}
            >
              Set Pending
            </button>
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium"
              onClick={() => handleStatusChange('in_progress')}
            >
              Set In Progress
            </button>
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium"
              onClick={() => handleStatusChange('completed')}
            >
              Set Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
