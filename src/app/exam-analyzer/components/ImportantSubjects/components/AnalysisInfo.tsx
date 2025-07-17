import React from 'react';
import { ViewType } from '../types';

interface AnalysisInfoProps {
  selectedView: ViewType;
}

const VIEW_DESCRIPTIONS: Record<ViewType, string> = {
  frequency: 'Konular, sınav verilerinizde geçen sıklığına göre sıralanmıştır. Konu grupları birden fazla konuyu birleştirerek daha kapsamlı analiz sağlar.',
  mistakes: 'Konular, ortalama hata yapma oranınıza göre sıralanmıştır. Yüksek oranlı konular daha fazla çalışma gerektirebilir.',
  empty: 'Konular, ortalama boş bırakma oranınıza göre sıralanmıştır. Bu konularda daha fazla pratik gerekebilir.'
};

export function AnalysisInfo({ selectedView }: AnalysisInfoProps) {
  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xl">💡</span>
        <span className="text-base font-semibold text-gray-700">
          Analiz Bilgisi
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        {VIEW_DESCRIPTIONS[selectedView]}
      </p>
    </div>
  );
} 