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

  const { rawNodes, rawEdges } = useProject();

  useEffect(() => {
    function loadTasks() {
      try {
        setLoading(true);
        if (!rawNodes || !rawEdges) return;

        const decodedId = decodeURIComponent(projectId || "").trim();
        // Filter nodes by project
        const projectNodes = rawNodes.filter(node => {
          const pName = (node.data?.project_name || "Project 1").trim();
          return pName === decodedId || pName === projectId;
        });

        const projectNodeIds = new Set(projectNodes.map(n => n.id));

        // Filter edges that connect project nodes
        const projectEdges = rawEdges.filter(edge => 
          projectNodeIds.has(edge.source) && projectNodeIds.has(edge.target)
        );

        setNodes(projectNodes);
        setEdges(projectEdges);
      } catch (err) {
        console.error("Failed to load tasks for workflow graph", err);
      } finally {
        setLoading(false);
      }
    }

    if (rawNodes && rawNodes.length > 0) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, [projectId, rawNodes, rawEdges, setNodes, setEdges]);

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
    return <div className="w-full h-[700px] flex items-center justify-center bg-white dark:bg-[#1A1E2E] rounded-xl border border-gray-200 dark:border-[#2A3142] text-gray-500 dark:text-white/50">Loading workflow...</div>;
  }

  return (
    <div className="w-full h-[700px] border border-gray-200 dark:border-[#2A3142] rounded-xl bg-white dark:bg-[#1A1E2E] shadow-sm overflow-hidden relative group">
      <button 
        onClick={() => setIsEditable(!isEditable)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${
          isEditable 
            ? 'bg-[#4A90E2] text-white hover:bg-[#3A7BC8]' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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

      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-[#2A3142] px-3 py-1 rounded-md text-sm font-bold shadow-md border border-gray-200 dark:border-gray-700">
        Nodes: {nodes.length} | Edges: {edges.length} | rawNodes: {rawNodes?.length || 0}
      </div>

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
          className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px] text-sm overflow-hidden"
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
