
import React from 'react';
import { RadarData } from '../types';

interface RadarChartProps {
  data: RadarData;
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  const { labels, values } = data;
  const numAxes = labels.length;
  const center = size / 2;
  const radius = (size / 2) * 0.8;

  // Calculate coordinates for a specific value on an axis
  const getCoordinates = (value: number, axisIndex: number) => {
    const angle = (Math.PI * 2 * axisIndex) / numAxes - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate web background circles
  const webs = [0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => {
    const points = Array.from({ length: numAxes }).map((_, j) => {
      const { x, y } = getCoordinates(100 * scale, j);
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={i} points={points} fill="none" stroke="#28392e" strokeWidth="1" />;
  });

  // Generate axis lines
  const axes = labels.map((label, i) => {
    const { x, y } = getCoordinates(100, i);
    const labelPos = getCoordinates(115, i);
    return (
      <g key={i}>
        <line x1={center} y1={center} x2={x} y2={y} stroke="#28392e" strokeWidth="1" />
        <text 
          x={labelPos.x} 
          y={labelPos.y} 
          fill="#9cbaa6" 
          fontSize="10" 
          fontWeight="900" 
          textAnchor="middle"
          dominantBaseline="middle"
          className="uppercase tracking-tighter"
        >
          {label}
        </text>
      </g>
    );
  });

  // Generate the data polygon
  const dataPoints = values.map((val, i) => {
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {webs}
      {axes}
      <polygon 
        points={dataPoints} 
        fill="rgba(13, 242, 89, 0.2)" 
        stroke="#0df259" 
        strokeWidth="3" 
        className="drop-shadow-[0_0_8px_rgba(13,242,89,0.5)]"
      />
      {values.map((val, i) => {
        const { x, y } = getCoordinates(val, i);
        return <circle key={i} cx={x} cy={y} r="4" fill="#0df259" />;
      })}
    </svg>
  );
};

export default RadarChart;
