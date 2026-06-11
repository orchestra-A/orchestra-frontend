import { useState } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Position } from '@xyflow/react';
import { Edit2, Lock } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { TaskNode, TrunkNode } from './workflow/Nodes';

const nodeTypes = {
  task: TaskNode,
  trunk: TrunkNode,
};

const defaultEdgeOptions = {
  type: 'step',
  style: { stroke: '#2563eb', strokeWidth: 3 },
};

const mockTasks = [
  { id: 'T1', title: 'System Architecture', status: 'in_progress' },
  { id: 'T2', title: 'Setup Dev Environment', status: 'stopped' },
  { id: 'T3', title: 'Design Database Schema', status: 'completed' },
  { id: 'T4', title: 'Implement Core API', status: 'todo' },
];

export function MockWorkflowCanvas() {
  const [isEditable, setIsEditable] = useState(false);

  const trunkY = 50;
  const taskSpacingY = 160; 
  const trunkHeight = Math.max(600, mockTasks.length * taskSpacingY + 100);

  const branchPoints = [];
  const generatedNodes = [];
  const generatedEdges = [];

  mockTasks.forEach((task, index) => {
    const isLeft = index % 2 === 0;
    const yOffset = index * taskSpacingY; 
    const branchPointTop = 70 + yOffset;
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
        status: task.status
      }
    });

    generatedEdges.push({
      id: `e-trunk-${task.id}`,
      source: 'trunk',
      target: task.id,
      sourceHandle: `bp-${task.id}`
    });
  });

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

  if (loading) {
    return <div className="w-full h-[700px] flex items-center justify-center bg-[#6B905F] dark:bg-[#1A1E2E] rounded-xl border border-gray-200 dark:border-[#2A3142] text-gray-500 dark:text-white/50">Loading workflow...</div>;
  }

  return (
    <div className="w-full h-[700px] border border-gray-200 dark:border-[#2A3142] rounded-xl bg-[#6B905F] dark:bg-[#1A1E2E] shadow-sm overflow-hidden relative group">
      <button 
        onClick={() => setIsEditable(!isEditable)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${
          isEditable 
            ? 'bg-[#6B905F] dark:bg-[#4A90E2] text-white hover:bg-[#5A7A4F] dark:hover:bg-[#3A7BC8]' 
            : 'bg-[#6B905F] dark:bg-[#4A90E2] text-gray-600 border border-gray-200 hover:bg-[#F3F7F1]'
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
        nodes={generatedNodes}
        edges={generatedEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
