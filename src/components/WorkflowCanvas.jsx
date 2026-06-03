import { useState } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position } from '@xyflow/react';
import { Edit2, Lock } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { TaskNode, TrunkNode } from './workflow/Nodes';

const nodeTypes = {
  task: TaskNode,
  trunk: TrunkNode,
};

const initialNodes = [
  { 
    id: 'trunk', 
    type: 'trunk', 
    position: { x: 400, y: 50 }, 
    data: { 
      height: 600,
      width: 24,
      branchPoints: [
        { id: 'bp-1', position: Position.Left, top: 100 },
        { id: 'bp-2', position: Position.Right, top: 220 },
        { id: 'bp-3', position: Position.Left, top: 380 },
        { id: 'bp-4', position: Position.Right, top: 480 },
      ]
    } 
  },
  { id: 'task-1', type: 'task', position: { x: 30, y: 160 }, data: { label: 'Design System' } },
  { id: 'task-2', type: 'task', position: { x: 550, y: 280 }, data: { label: 'API Integration' } },
  { id: 'task-3', type: 'task', position: { x: 30, y: 440 }, data: { label: 'User Testing' } },
  { id: 'task-4', type: 'task', position: { x: 550, y: 540 }, data: { label: 'Deployment' } },
];

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#94A3B8', strokeWidth: 3, borderRadius: 24 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94A3B8',
    width: 20,
    height: 20,
  },
};

const initialEdges = [
  { id: 'e-1', source: 'trunk', target: 'task-1', sourceHandle: 'bp-1' },
  { id: 'e-2', source: 'trunk', target: 'task-2', sourceHandle: 'bp-2' },
  { id: 'e-3', source: 'trunk', target: 'task-3', sourceHandle: 'bp-3' },
  { id: 'e-4', source: 'trunk', target: 'task-4', sourceHandle: 'bp-4' },
];

export function WorkflowCanvas() {
  const [isEditable, setIsEditable] = useState(false);

  return (
    <div className="w-full h-[700px] border border-gray-200 rounded-xl bg-[#F9FAFB] shadow-sm overflow-hidden relative group">
      {/* Top Right Toggle Button */}
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

      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Background variant="dots" gap={20} size={2} color="#CBD5E1" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
