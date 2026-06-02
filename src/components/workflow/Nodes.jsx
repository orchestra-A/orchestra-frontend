import { Handle, Position } from '@xyflow/react';
import { CheckSquare, Target, PauseCircle, Clock, User } from 'lucide-react';

export function TaskNode({ data }) {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed': return { bg: 'bg-[#4CAF50]', icon: <CheckSquare className="w-6 h-6 text-white" /> };
      case 'in_progress': return { bg: 'bg-[#FFB300]', icon: <Target className="w-6 h-6 text-white" /> };
      case 'todo': return { bg: 'bg-[#2F80ED]', icon: <Clock className="w-6 h-6 text-white" /> };
      case 'stopped': return { bg: 'bg-[#F44336]', icon: <PauseCircle className="w-6 h-6 text-white" /> };
      default: return { bg: 'bg-[#9E9E9E]', icon: <User className="w-6 h-6 text-white" /> };
    }
  };
  
  const config = getStatusConfig(data.status);

  return (
    <div className={`${config.bg} text-white rounded-lg shadow-md px-4 py-3 min-w-[180px] flex items-center gap-3 border border-black/5`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-white !border-2 !border-[#2F80ED]" 
      />
      <div className="flex items-center justify-center pr-3 border-r border-white/40 shrink-0">
        {config.icon}
      </div>
      <div className="font-medium text-base truncate max-w-[200px]" title={data.label}>
        {data.label}
        {data.assigned_to && (
          <div className="text-xs font-normal text-white/80 mt-0.5 truncate max-w-[200px]" title={data.assigned_to}>
            {data.assigned_to}
          </div>
        )}
      </div>
    </div>
  );
}

export function TrunkNode({ data }) {
  const height = data.height || 600;
  const width = data.width || 16;

  return (
    <div className="relative flex flex-col items-center" style={{ width, height }}>
      {/* Solid Blue Trunk with sharper Chevron Cutout and Arrowhead */}
      <div 
        className="bg-[#2F80ED] shadow-sm" 
        style={{ 
          width: '100%', 
          height: '100%',
          clipPath: `polygon(0 0, 50% 20px, 100% 0, 100% calc(100% - 30px), 50% 100%, 0 calc(100% - 30px))`
        }} 
      />
      
      {/* Dynamic Branch Points (Handles) */}
      {data.branchPoints && data.branchPoints.map((bp) => (
        <Handle
          key={bp.id}
          type="source"
          id={bp.id}
          position={bp.position}
          className="!w-4 !h-4 !bg-white !border-2 !border-[#2F80ED] shadow-sm transition-transform hover:scale-125"
          style={{ 
            top: bp.top, 
            left: bp.position === Position.Left ? -8 : undefined,
            right: bp.position === Position.Right ? -8 : undefined,
          }}
        />
      ))}
    </div>
  );
}
