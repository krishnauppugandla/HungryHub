import React from "react";

const EmptyState = ({ icon = "🍽️", title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    {message && <p className="text-gray-500 mb-6 max-w-sm">{message}</p>}
    {action}
  </div>
);

export default EmptyState;
