import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export function EmptyState({ 
  title = "Konu Analizi",
  description = "Analiz için en az bir sınav verisi gerekiyor.",
  icon = "🎯"
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-8 bg-gray-50 rounded-2xl border border-gray-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-medium text-gray-500 mb-4">
        {title}
      </h2>
      <p className="text-gray-500 text-base">
        {description}
      </p>
    </div>
  );
} 