import React from 'react';

const MergedShape = ({ 
  fill = "rgba(255, 255, 255, 0.05)", 
  children, 
  className = "", 
  style: containerStyle,
  width = 460,
  height = 520,
  mainWidth = 390,
  tabLeft = 390,
  tabTop = 60,
  ...props 
}) => (
  <div className={`overflow-visible flex justify-center items-center ${className}`}>
    <div
      className="relative shrink-0 scale-[0.65] sm:scale-[0.8] md:scale-100 origin-center transition-transform duration-500"
      style={{
        width,
        height,
        ...containerStyle,
      }}
      {...props}
    >
      {/* Shape 1 - Main Body */}
      <div
        className="absolute left-0 top-0 rounded-[32px] border border-white/10"
        style={{
          width: mainWidth,
          height: height,
          backgroundColor: fill,
          backdropFilter: 'blur(16px)',
        }}
      >
      </div>

      {/* Shape 2 - Right Tab */}
      <div
        className="absolute w-[70px] h-[50px] rounded-r-[32px] border-y border-r border-white/10"
        style={{
          left: tabLeft,
          top: tabTop,
          backgroundColor: fill,
          backdropFilter: 'blur(16px)',
        }}
      >
      </div>

      {/* Bridge 1 */}
      <svg
        className="absolute w-8 h-8 pointer-events-none"
        style={{
          left: tabLeft,
          top: tabTop - 32,
        }}
        viewBox="0 0 32 32"
      >
        <path d="M 0 0 C 0 23.872 5.76 32 32 32 H 0 Z" fill={fill} />
        <path d="M 0 0 C 0 23.872 5.76 32 32 32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      {/* Bridge 2 */}
      <svg
        className="absolute w-8 h-8 pointer-events-none"
        style={{
          left: tabLeft,
          top: tabTop + 50,
        }}
        viewBox="0 -32 32 32"
      >
        <path d="M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" fill={fill} />
        <path d="M 0 0 C 0 -23.872 5.76 -32 32 -32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      {/* Children Container */}
      <div className="absolute inset-0 z-10">
        {children}
      </div>
    </div>
  </div>
);

export default MergedShape;
