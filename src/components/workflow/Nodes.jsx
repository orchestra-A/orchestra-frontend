import { Handle, Position } from '@xyflow/react';

import { CheckSquare, Target, PauseCircle, Clock, User, Code2 } from 'lucide-react';

export function TaskNode({ data }) {
  const getColors = (status) => {
    switch (status) {
      case 'completed': return { header: '#86efac', body: '#22c55e' }; // Green
      case 'stopped': 
      case 'paused': return { header: '#991b1b', body: '#ef4444' }; // Red
      case 'in_progress': 
      case 'ongoing': return { header: '#f97316', body: '#fbbf24' }; // Yellow/Orange
      case 'todo': 
      case 'pending': return { header: '#475569', body: '#06b6d4' }; // Blue/Teal
      default: return { header: '#64748b', body: '#94a3b8' }; // Gray
    }
  };

  const { header: headerColor, body: bodyColor } = getColors(data.status);

  return (
    <div className="relative w-[220px] shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden flex flex-col">
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-0 !h-0 border-0" />
      <div 
        className="h-[30px] w-full z-10 relative flex items-center px-3"
        style={{ 
          backgroundColor: headerColor,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' 
        }}
      >
        <span className="text-white text-xs font-bold truncate opacity-90 drop-shadow-sm">
          {data.assigned_to || "Unassigned"}
        </span>
      </div>
      <div 
        className="h-[90px] w-full flex items-center justify-center p-3 text-center"
        style={{ backgroundColor: bodyColor }}
      >
        <span className="text-white font-semibold text-sm drop-shadow-md">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-0 !h-0 border-0" />
    </div>
  );
}

export function DeveloperNode({ data }) {
  return (
    <div className="bg-[#9B59B6] text-white rounded-full shadow-md px-4 py-2 min-w-[120px] flex items-center justify-center gap-2 border border-black/5">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#4A90E2] !border-[#9B59B6]" />
      <User className="w-4 h-4 text-white" />
      <div className="font-medium text-sm truncate max-w-[150px]" title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#4A90E2] !border-[#9B59B6]" />
    </div>
  );
}

export function SkillNode({ data }) {
  return (
    <div className="bg-[#F59E42] text-white rounded-full shadow-md px-3 py-1.5 min-w-[100px] flex items-center justify-center gap-2 border border-black/5">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#4A90E2] !border-[#F59E42]" />
      <Code2 className="w-3 h-3 text-white" />
      <div className="font-medium text-xs truncate max-w-[120px]" title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#4A90E2] !border-[#F59E42]" />
    </div>
  );
}

export function TrunkNode({ data }) {
  const height = data.height || 600;

  return (
    <div className="relative flex justify-center" style={{ width: 40, height }}>
      <div className="absolute top-0 bottom-[30px] flex justify-between w-full">
        <div className="w-[4px] bg-[#2563eb] h-full shadow-sm"></div>
        <div className="w-[8px] bg-[#2563eb] h-full shadow-sm"></div>
        <div className="w-[4px] bg-[#2563eb] h-full shadow-sm"></div>
      </div>
      <div 
        className="absolute bottom-[-10px] w-0 h-0 border-l-[35px] border-r-[35px] border-t-[50px] border-transparent"
        style={{ borderTopColor: '#2563eb', filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.3))' }}
      ></div>
      {data.branchPoints && data.branchPoints.map((bp) => (
        <Handle
          key={bp.id}
          type="source"
          id={bp.id}
          position={bp.position}
          className="!opacity-0 !w-0 !h-0 border-0"
          style={{ 
            top: bp.top, 
            left: bp.position === Position.Left ? 0 : undefined,
            right: bp.position === Position.Right ? 0 : undefined,
          }}
        />
      ))}
    </div>
  );
}
