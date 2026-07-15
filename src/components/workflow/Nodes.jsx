import { Handle, Position } from '@xyflow/react';

import { CheckSquare, Target, PauseCircle, Clock, User, Code2 } from 'lucide-react';

export function TaskNode({ data }) {
  const getColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
        return { header: '#22c55e', body: '#dcfce7', text: '#166534' }; // Green
      case 'stopped': 
      case 'paused': 
      case 'error':
        return { header: '#ef4444', body: '#fde8e8', text: '#991b1b' }; // Red
      case 'in_progress': 
      case 'ongoing': 
        return { header: '#f59e0b', body: '#fef3c7', text: '#92400e' }; // Yellow
      case 'todo': 
      case 'pending': 
      default: 
        return { header: '#0ea5e9', body: '#e0f2fe', text: '#075985' }; // Blue
    }
  };

  const { header: headerColor, body: bodyColor, text: textColor } = getColors(data.status);
  const isHighlighted = data.isHighlighted;
  const isDimmed = data.isDimmed;

  return (
    <div 
      className={`relative w-[240px] rounded-lg overflow-hidden flex flex-col border transition-all duration-300 ${
        isDimmed 
          ? 'opacity-25 scale-[0.97] border-black/5' 
          : isHighlighted 
            ? 'opacity-100 scale-[1.03]' 
            : 'opacity-100 scale-100 border-black/5'
      }`}
      style={{
        boxShadow: isHighlighted 
          ? `0 0 25px 6px ${headerColor}bb` 
          : '0 2px 10px rgba(0,0,0,0.08)',
        borderColor: isHighlighted ? headerColor : undefined,
        borderWidth: isHighlighted ? '2px' : '1px'
      }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-0 !h-0 border-0" />
      <div 
        className="h-[36px] w-full z-10 relative flex items-center px-3 gap-2"
        style={{ backgroundColor: headerColor }}
      >
        <User className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-semibold truncate">
          {data.assigned_to || "Unassigned"}
        </span>
      </div>
      <div 
        className="min-h-[80px] w-full flex items-center justify-center p-4 text-center"
        style={{ backgroundColor: bodyColor }}
      >
        <span 
          className="font-semibold text-[13px] leading-snug" 
          style={{ color: textColor }}
        >
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-0 !h-0 border-0" />
    </div>
  );
}

export function DeveloperNode({ data }) {
  return (
    <div className="bg-[#9B59B6] text-white rounded-full shadow-md px-4 py-2 min-w-[120px] flex items-center justify-center gap-2 border border-black/5">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#6B905F] !border-[#9B59B6]" />
      <User className="w-4 h-4 text-white" />
      <div className="font-medium text-sm truncate max-w-[150px]" title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#6B905F] !border-[#9B59B6]" />
    </div>
  );
}

export function SkillNode({ data }) {
  return (
    <div className="bg-[#F59E42] text-white rounded-full shadow-md px-3 py-1.5 min-w-[100px] flex items-center justify-center gap-2 border border-black/5">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#6B905F] !border-[#F59E42]" />
      <Code2 className="w-3 h-3 text-white" />
      <div className="font-medium text-xs truncate max-w-[120px]" title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#6B905F] dark:bg-[#6B905F] !border-[#F59E42]" />
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
