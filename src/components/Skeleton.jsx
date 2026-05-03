import React from 'react';

export const Skeleton = ({ className }) => {
  return (
    <div className={`skeleton ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="skeleton rounded-[2.5rem] p-10 h-[500px] flex flex-col gap-6">
      <div className="skeleton h-56 w-full rounded-2xl" />
      <div className="skeleton h-10 w-3/4 rounded-full" />
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="skeleton h-14 w-full mt-auto rounded-2xl" />
    </div>
  );
};

export default Skeleton;
