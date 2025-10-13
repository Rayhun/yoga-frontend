'use client';

import React, { useState, useEffect } from 'react';

const DonutChart = ({ 
  value, 
  maxValue = 100, 
  size = 120, 
  strokeWidth = 12, 
  color = '#3B82F6', 
  backgroundColor = '#E5E7EB',
  title,
  subtitle,
  centerText,
  centerSubtext,
  onClick,
  className = "",
  showTooltip = true,
  animated = true
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  // Create unique IDs for gradients
  const bgGradientId = `bg-${title?.replace(/\s+/g, '-').toLowerCase()}-${color.replace('#', '')}`;
  const progressGradientId = `progress-${title?.replace(/\s+/g, '-').toLowerCase()}-${color.replace('#', '')}`;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedValue / maxValue) * circumference;
  const strokeDasharray = `${progress} ${circumference}`;

  // Animate value on mount
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (showTooltip) {
      setShowTooltipState(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (showTooltip) {
      setShowTooltipState(false);
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
      {/* {showTooltip && showTooltipState && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-20 animate-fadeIn">
          <div className="text-center">
            <div className="font-semibold">{title}</div>
            <div className="text-xs opacity-90">{subtitle}</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )} */}

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-30' : 'opacity-0'}`} 
           style={{ 
             background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
             filter: 'blur(20px)'
           }}>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Background circle with subtle gradient */}
          <defs>
            <linearGradient id={bgGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={backgroundColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={backgroundColor} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id={progressGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${bgGradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-all duration-300"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${progressGradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${isHovered ? 'drop-shadow-lg' : ''}`}
            style={{
              filter: isHovered ? `drop-shadow(0 0 8px ${color}40)` : 'none'
            }}
          />
        </svg>
        
        {/* Center text with pulse animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
            {animatedValue}
          </div>
          {centerSubtext && (
            <div className={`text-sm text-gray-600 transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
              {centerSubtext}
            </div>
          )}
        </div>

        {/* Pulse ring effect */}
        {isHovered && (
          <div 
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ 
              borderColor: color,
              animationDuration: '1.5s'
            }}
          />
        )}
      </div>
      
      {/* Title and subtitle with enhanced styling */}
      <div className="text-center mt-6 transition-all duration-300">
        <h3 className={`font-bold text-gray-900 text-xl transition-all duration-300 ${isHovered ? 'scale-105 text-gray-800' : ''}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm text-gray-600 mt-2 transition-all duration-300 ${isHovered ? 'scale-105 text-gray-700' : ''}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Click indicator */}
      <div className={`mt-3 text-xs text-gray-400 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Click to view details
      </div>
    </div>
  );
};

export default DonutChart;
