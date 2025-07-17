import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ 
  message = "Konu verileri analiz ediliyor..." 
}: LoadingStateProps) {
  return (
    <div className="text-center py-16 px-8 bg-blue-50 rounded-2xl border border-blue-200">
      <div className="text-6xl mb-4">
        <div className="animate-spin">⚡</div>
      </div>
      <h2 className="text-2xl font-medium text-blue-600 mb-4">
        Analiz Yapılıyor
      </h2>
      <p className="text-blue-500 text-base">
        {message}
      </p>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
} 