
import { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position, useNodesState, useEdgesState } from '@xyflow/react';
import { Edit2, Lock } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { TaskNode, TrunkNode } from './workflow/Nodes';

const nodeTypes = {
  task: TaskNode,
  trunk: TrunkNode,
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

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        // Using the Vite proxy (/api) to avoid CORS issues from the backend
        const res = await fetch('/api/tasks');
        const data = await res.json();
        
        // Filter and sort by order
        const projectTasks = data.tasks
          .filter(t => t.project_id === projectId)
          .sort((a, b) => a.order - b.order);

        // Layout Geometry
        const trunkY = 50;
        const taskSpacingY = 160; 
        const trunkHeight = Math.max(600, projectTasks.length * taskSpacingY + 100);

        const branchPoints = [];
        const generatedNodes = [];
        const generatedEdges = [];

        projectTasks.forEach((task, index) => {
          const isLeft = index % 2 === 0;
          const yOffset = index * taskSpacingY; 
          const branchPointTop = 70 + yOffset;
          // Drop 40px to give smoothstep enough room to curve
          const taskNodeY = trunkY + branchPointTop + 40; 
          
          branchPoints.push({
            id: `bp-${task.id}`,
            position: isLeft ? Position.Left : Position.Right,
            top: branchPointTop
          });

          generatedNodes.push({
            id: task.id,
            type: 'task',
            position: { x: isLeft ? 30 : 550, y: taskNodeY },
            data: { 
              label: task.title, 
              status: task.status,
              assigned_to: task.assigned_to 
            }
          });

          generatedEdges.push({
            id: `e-trunk-${task.id}`,
            source: 'trunk',
            target: task.id,
            sourceHandle: `bp-${task.id}`
          });
        });

        // Add trunk node
        generatedNodes.unshift({
          id: 'trunk',
          type: 'trunk',
          position: { x: 400, y: trunkY },
          data: {
            height: trunkHeight,
            width: 16,
            branchPoints
          }
        });

        setNodes(generatedNodes);
        setEdges(generatedEdges);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [projectId, setNodes, setEdges]);

  if (loading) {
    return <div className="w-full h-[700px] flex items-center justify-center bg-[#F9FAFB] rounded-xl border border-gray-200 text-gray-500">Loading workflow...</div>;
  }

  return (
    <div className="w-full h-[700px] border border-gray-200 rounded-xl bg-[#F9FAFB] shadow-sm overflow-hidden relative group">
    <div className="w-full h-[700px] border border-gray-200 rounded-xl bg-[#F9FAFB] shadow-sm overflow-hidden relative group">
      <button 
        onClick={() => setIsEditable(!isEditable)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${
          isEditable 
            ? 'bg-[#4A90E2] text-white hover:bg-[#3A7BC8]' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        <Background variant="dots" gap={20} size={2} color="#CBD5E1" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
