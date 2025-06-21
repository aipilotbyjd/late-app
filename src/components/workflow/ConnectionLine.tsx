
import React from 'react';

interface ConnectionLineProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourcePosition,
  targetPosition
}) => {
  const createPath = () => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    
    // Calculate control points for a smooth curve
    const controlPoint1X = sourcePosition.x + dx * 0.5;
    const controlPoint1Y = sourcePosition.y;
    const controlPoint2X = targetPosition.x - dx * 0.5;
    const controlPoint2Y = targetPosition.y;
    
    return `M ${sourcePosition.x} ${sourcePosition.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetPosition.x} ${targetPosition.y}`;
  };

  return (
    <g>
      {/* Shadow/outline */}
      <path
        d={createPath()}
        stroke="rgba(0, 0, 0, 0.1)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Main line */}
      <path
        d={createPath()}
        stroke="url(#connectionGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="animate-pulse"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="url(#connectionGradient)"
          />
        </marker>
        
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      
      <path
        d={createPath()}
        stroke="url(#connectionGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
};

export default ConnectionLine;
