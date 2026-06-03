import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, User } from 'lucide-react';

export function TaskNode({ data }) {
  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] px-5 py-4 min-w-[220px] border border-gray-100 transition-all hover:shadow-[0_8px_30px_-4px_rgba(74,144,226,0.15)] hover:border-[#4A90E2]/30">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-[#4A90E2] !border-2 !border-white" 
      />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#4A90E2]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{data.label}</h3>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
            <User className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-1 bg-blue-50 text-[#4A90E2] rounded-full">High Priority</span>
      </div>
    </div>
  );
}

export function TrunkNode({ data }) {
  const height = data.height || 600;
  const width = data.width || 40;
  
  const arrowHeadHeight = width;
  const arrowHeadWidth = width * 1.5;
  const trunkHeight = height - arrowHeadHeight;

  return (
    <div className="relative flex flex-col items-center" style={{ width: arrowHeadWidth, height }}>
      {/* Trunk body with premium gradient */}
      <div 
        className="bg-gradient-to-b from-[#4A90E2] via-[#6366F1] to-[#8B5CF6] rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
        style={{ width, height: trunkHeight }} 
      />
      {/* Stylized Arrow head */}
      <div 
        style={{
          width: 0,
          height: 0,
          borderLeft: `${arrowHeadWidth / 2}px solid transparent`,
          borderRight: `${arrowHeadWidth / 2}px solid transparent`,
          borderTop: `${arrowHeadHeight}px solid #8B5CF6`,
          filter: 'drop-shadow(0px 8px 6px rgba(139,92,246,0.3))'
        }}
      />
      
      {/* Dynamic Branch Points (Handles) */}
      {data.branchPoints && data.branchPoints.map((bp) => (
        <Handle
          key={bp.id}
          type="source"
          id={bp.id}
          position={bp.position}
          className="!w-4 !h-4 !bg-white !border-4 !border-[#6366F1] shadow-sm transition-transform hover:scale-125"
          style={{ 
            top: bp.top, 
            left: bp.position === Position.Left ? (arrowHeadWidth - width) / 2 - 8 : undefined,
            right: bp.position === Position.Right ? (arrowHeadWidth - width) / 2 - 8 : undefined,
          }}
        />
      ))}
    </div>
  );
}
