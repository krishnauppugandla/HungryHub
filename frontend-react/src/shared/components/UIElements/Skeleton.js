import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className}`} />
);

export const RestaurantCardSkeleton = () => (
  <div className="card p-0 overflow-hidden">
    <div className="skeleton h-48 w-full rounded-t-2xl rounded-b-none" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  </div>
);

export const MenuItemSkeleton = () => (
  <div className="card p-4 flex gap-4">
    <div className="flex-1 space-y-2">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-1/3" />
    </div>
    <div className="skeleton h-24 w-24 rounded-xl flex-shrink-0" />
  </div>
);
