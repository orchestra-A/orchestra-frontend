import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: 'Start Node' } },
  { id: '2', position: { x: 250, y: 50 }, data: { label: 'Process Data' } },
  { id: '3', position: { x: 250, y: 150 }, data: { label: 'Output Result' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
];

export function WorkflowCanvas() {
  return (
    <div className="w-full h-[400px] border border-border rounded-md bg-surface-2">
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
