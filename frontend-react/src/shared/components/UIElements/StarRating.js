import React from "react";

const StarRating = ({ rating = 0, count, size = "sm" }) => {
  const stars = [1, 2, 3, 4, 5];
  const sz = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-0.5 ${sz}`}>
      {stars.map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}>
          ★
        </span>
      ))}
      {count !== undefined && (
        <span className="text-gray-500 text-xs ml-1">({count})</span>
      )}
    </span>
  );
};

export default StarRating;
