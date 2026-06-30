import { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position, useNodesState, useEdgesState } from '@xyflow/react';
import { Edit2, Lock } from 'lucide-react';
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
  style: { stroke: '#2F80ED', strokeWidth: 4, borderRadius: 24 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#2F80ED',
  },
};

export function WorkflowCanvas({ projectId = "proj_marketing" }) {
  const [isEditable, setIsEditable] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  const { tasks } = useProject();

  useEffect(() => {
    function loadTasks() {
      try {
        setLoading(true);
        if (!tasks || tasks.length === 0) return;

        const decodedId = decodeURIComponent(projectId || "").trim();
        
        // Filter tasks by project
        const projectTasks = tasks.filter(t => {
          const pName = (t.project_id || "Project 1").trim();
          return pName === decodedId || pName === projectId;
        });

        if (projectTasks.length === 0) {
           setNodes([]);
           setEdges([]);
           return;
        }

        // Group by order to create layers
        const layers = {};
        let maxOrder = 0;
        
        projectTasks.forEach(t => {
          // If order is null, we'll put it at the bottom layer later
          const order = t.order || 999; 
          if (!layers[order]) layers[order] = [];
          layers[order].push(t);
          if (order > maxOrder && order !== 999) maxOrder = order;
        });
        
        // If there were tasks with null order, place them in maxOrder + 1
        if (layers[999]) {
           layers[maxOrder + 1] = layers[999];
           delete layers[999];
        }

        const newNodes = [];
        const newEdges = [];

        // Build Nodes
        Object.keys(layers).sort((a, b) => Number(a) - Number(b)).forEach((orderStr, layerIndex) => {
          const group = layers[orderStr];
          const yPosition = layerIndex * 220; // Vertical spacing between layers increased
          
          group.forEach((t, i) => {
            // Center the nodes horizontally.
            const xPosition = (i - (group.length - 1) / 2) * 350; // Horizontal spacing increased
            
            newNodes.push({
              id: t.id,
              type: "task",
              position: { x: xPosition, y: yPosition },
              data: {
                label: t.title,
                status: t.status,
                assigned_to: t.assigned_to,
                project_name: t.project_id || "Project 1",
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
                 newEdges.push({
                   id: `e-${dep}-${t.id}`,
                   source: dep,
                   target: t.id,
                   type: "smoothstep"
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
  }, [projectId, tasks, setNodes, setEdges]);

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

  return (
    <div className="w-full h-full border border-gray-200 dark:border-[#27272A] rounded-xl bg-[#F4F1EB] dark:bg-[#09090B] shadow-sm overflow-hidden relative group">
      <button 
        onClick={() => setIsEditable(!isEditable)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${
          isEditable 
            ? 'bg-white dark:bg-[#6B905F] text-[#6B905F] dark:text-white hover:bg-gray-50' 
            : 'bg-white dark:bg-[#6B905F] text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        {isEditable ? (
          <>
            <Edit2 className="w-4 h-4" />
            Editing Mode: ON
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Editing Mode: OFF
          </>
        )}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable}
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
  );
}
