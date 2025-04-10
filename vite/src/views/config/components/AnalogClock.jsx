import React from 'react';
import { Box } from '@mui/material';

const AnalogClock = ({ time }) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <Box
      sx={{
        width: '200px',
        height: '200px',
        position: 'relative',
        margin: '20px auto',
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Clock face */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="white"
          stroke="#0f1de8"
          strokeWidth="2"
        />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 50 + 40 * Math.cos(angle);
          const y1 = 50 + 40 * Math.sin(angle);
          const x2 = 50 + 45 * Math.cos(angle);
          const y2 = 50 + 45 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#0f1de8"
              strokeWidth={i % 3 === 0 ? "2" : "1"}
            />
          );
        })}

        {/* Hour hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke="#0f1de8"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${hourDegrees}, 50, 50)`}
        />

        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="#3e4aec"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${minuteDegrees}, 50, 50)`}
        />

        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke="#f00"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${secondDegrees}, 50, 50)`}
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="2" fill="#0f1de8" />
      </svg>
    </Box>
  );
};

export default AnalogClock; 