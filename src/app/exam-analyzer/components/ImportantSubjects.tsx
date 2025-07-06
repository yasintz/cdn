import { dersler } from '../modules/helpers';
import { newImpl } from '../new';
import { UserAnswer } from '../modules/helpers';
import { useState } from 'react';

interface ImportantSubjectsProps {
  data: ReturnType<typeof newImpl>;
}

type ViewType = 'frequency' | 'mistakes' | 'empty';

export function ImportantSubjects({
  data: { importantSubjects, examCount, analytics },
}: ImportantSubjectsProps) {
  const [selectedView, setSelectedView] = useState<ViewType>('frequency');
  const [subjectCount, setSubjectCount] = useState<number>(5);

  const lessonColors: Record<string, string> = {
    'Türkçe': 'bg-blue-50',
    'Matematik': 'bg-purple-50',
    'Tarih': 'bg-orange-50',
    'Coğrafya': 'bg-green-50',
    'Felsefe': 'bg-pink-50',
    'Din Kültürü': 'bg-lime-50',
    'Fizik': 'bg-teal-50',
    'Kimya': 'bg-yellow-50',
    'Biyoloji': 'bg-purple-50',
    'Geometri': 'bg-indigo-50',
    'Tum Dersler': 'bg-gray-50'
  };

  const lessonIcons: Record<string, string> = {
    'Türkçe': '📚',
    'Matematik': '🔢',
    'Tarih': '🏛️',
    'Coğrafya': '🌍',
    'Felsefe': '🤔',
    'Din Kültürü': '📿',
    'Fizik': '⚛️',
    'Kimya': '🧪',
    'Biyoloji': '🧬',
    'Geometri': '📐',
    'Tum Dersler': '🎯'
  };

  const getBorderColor = (lesson: string) => {
    const colors: Record<string, string> = {
      'Türkçe': 'border-blue-500',
      'Matematik': 'border-purple-500',
      'Tarih': 'border-orange-500',
      'Coğrafya': 'border-green-500',
      'Felsefe': 'border-pink-500',
      'Din Kültürü': 'border-lime-500',
      'Fizik': 'border-teal-500',
      'Kimya': 'border-yellow-500',
      'Biyoloji': 'border-purple-500',
      'Geometri': 'border-indigo-500',
      'Tum Dersler': 'border-gray-500'
    };
    return colors[lesson] || 'border-gray-500';
  };

  const getIntensityColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'text-red-700'; // High intensity - red
    if (ratio >= 0.6) return 'text-orange-600'; // Medium-high - orange
    if (ratio >= 0.4) return 'text-yellow-600'; // Medium - yellow
    if (ratio >= 0.2) return 'text-green-600'; // Low-medium - light green
    return 'text-green-700'; // Low intensity - green
  };

  // Get data based on selected view
  const getViewData = () => {
    switch (selectedView) {
      case 'mistakes':
        return {
          title: 'En Çok Hata Yapılan Konular',
          icon: '❌',
          description: 'Ortalama hata oranına göre sıralanmış konular',
          data: analytics.subjectBasedData[UserAnswer.False] || [],
          valueKey: 'rate' as const,
          valueLabel: 'Hata Oranı',
          formatValue: (value: number) => `%${(value * 100).toFixed(1)}`,
          color: 'bg-red-500',
          colorClass: 'bg-red-500'
        };
      case 'empty':
        return {
          title: 'En Çok Boş Bırakılan Konular',
          icon: '⭕',
          description: 'Ortalama boş bırakma oranına göre sıralanmış konular',
          data: analytics.subjectBasedData[UserAnswer.Skip] || [],
          valueKey: 'rate' as const,
          valueLabel: 'Boş Oranı',
          formatValue: (value: number) => `%${(value * 100).toFixed(1)}`,
          color: 'bg-gray-500',
          colorClass: 'bg-gray-500'
        };
      default:
        return {
          title: 'En Sık Karşılaşılan Konular',
          icon: '📊',
          description: 'Sınav verilerinde en sık geçen konular',
          data: Object.values(importantSubjects.subjectCounts.inAllClass).map(subject => ({
            ...subject,
            rate: subject.total / examCount
          })),
          valueKey: 'total' as const,
          valueLabel: 'Toplam Soru',
          formatValue: (value: number) => `${Math.round(value / examCount)}x`,
          color: 'bg-blue-500',
          colorClass: 'bg-blue-500'
        };
    }
  };

  const viewData = getViewData();
  const lessons = [...dersler.map((i) => i.name), 'Tum Dersler'];

  // Group data by lesson
  const getSubjectsByLesson = (lesson: string) => {
    if (selectedView === 'frequency') {
      const subjects = (lesson === 'Tum Dersler'
        ? importantSubjects.subjectCounts.inAllClass
        : importantSubjects.subjectCounts.byClass[lesson]
      )?.filter((i) => i.subject)?.slice(0, subjectCount) || [];
      
      return subjects.map(subject => ({
        ...subject,
        rate: subject.total / examCount,
        displayValue: Math.round(subject.total / examCount),
        progressValue: subject.total
      }));
    } else {
      const allSubjects = viewData.data.filter(subject => 
        lesson === 'Tum Dersler' || subject.className === lesson
      ).slice(0, subjectCount);
      
      return allSubjects.map(subject => ({
        ...subject,
        displayValue: subject.rate,
        progressValue: subject.rate
      }));
    }
  };

  // Calculate max values for progress bars
  const getAllSubjects = () => {
    if (selectedView === 'frequency') {
      return lessons.flatMap(lesson => getSubjectsByLesson(lesson));
    }
    return viewData.data.map(subject => ({
      ...subject,
      progressValue: subject.rate
    }));
  };

  const allSubjects = getAllSubjects();
  const maxValue = Math.max(...allSubjects.map(s => s.progressValue || s.rate || 0));

  if (examCount === 0) {
    return (
      <div className="text-center py-16 px-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-medium text-gray-500 mb-4">
          Konu Analizi
        </h2>
        <p className="text-gray-500 text-base">
          Analiz için en az bir sınav verisi gerekiyor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-2xl">
        <div className="text-5xl mb-4">{viewData.icon}</div>
        <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">
          {viewData.title}
        </h1>
        <p className="text-lg opacity-90 font-light mb-6">
          {examCount} sınav verisi - {viewData.description}
        </p>

        {/* View Selector Dropdown */}
        <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value as ViewType)}
            className="px-4 py-3 rounded-lg border-none bg-white/90 text-gray-800 text-base font-semibold cursor-pointer min-w-[250px] shadow-lg"
          >
            <option value="frequency">📊 En Sık Karşılaşılan Konular</option>
            <option value="mistakes">❌ En Çok Hata Yapılan Konular</option>
            <option value="empty">⭕ En Çok Boş Bırakılan Konular</option>
          </select>
          
          <div className="flex items-center gap-2 bg-white/90 px-3 py-3 rounded-lg shadow-lg">
            <span className="text-base font-semibold text-gray-800 whitespace-nowrap">
              📊 Konu Sayısı:
            </span>
            <input
              type="number"
              min="1"
              max="20"
              value={subjectCount}
              onChange={(e) => setSubjectCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="px-2 py-1 rounded border border-gray-300 w-15 text-center text-base font-semibold text-gray-800 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold mb-1">
            {examCount}
          </div>
          <div className="text-sm opacity-90">
            Toplam Sınav
          </div>
        </div>

        <div className={`bg-gradient-to-br from-current to-current/80 text-white p-6 rounded-xl text-center shadow-lg ${viewData.colorClass}`}>
          <div className="text-3xl mb-2">{viewData.icon}</div>
          <div className="text-3xl font-bold mb-1">
            {viewData.data.length}
          </div>
          <div className="text-sm opacity-90">
            Analiz Edilen Konu
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-3xl font-bold mb-1">
            {lessons.length - 1}
          </div>
          <div className="text-sm opacity-90">
            Ders Alanı
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {lessons.map((lesson) => {
          const subjects = getSubjectsByLesson(lesson);

          if (subjects.length === 0) return null;

          return (
            <div 
              key={lesson} 
              className={`bg-white rounded-2xl p-0 shadow-xl border-4 ${getBorderColor(lesson)} overflow-hidden transition-all duration-300 hover:shadow-2xl relative`}
            >
              {/* Card Header */}
              <div className={`${lessonColors[lesson]} p-6 border-b-2 ${getBorderColor(lesson)}/20 relative`}>
                <div className="absolute top-4 right-4 text-5xl opacity-10">
                  {lessonIcons[lesson]}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">
                    {lessonIcons[lesson]}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">
                    {lesson}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{viewData.icon}</span>
                  <span>{subjects.length} konu gösteriliyor</span>
                </div>
              </div>

              {/* Subjects List */}
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {subjects.map((subject, index) => {
                    const progressPercentage = (subject.progressValue / maxValue) * 100;
                    const averageQuestions = subject.total / examCount;
                    
                    return (
                      <div 
                        key={`${subject.className}-${subject.subject}`}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden"
                      >
                        {/* Progress Background */}
                        <div 
                          className={`absolute top-0 left-0 h-full ${viewData.colorClass}/20 rounded-xl transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`${viewData.colorClass} text-white px-2 py-1 rounded-2xl text-xs font-bold min-w-8 text-center`}>
                                #{index + 1}
                              </span>
                              <span className={`${getBorderColor(lesson)}/20 ${getBorderColor(lesson).replace('border-', 'text-')} px-3 py-1 rounded-2xl text-xs font-semibold`}>
                                {selectedView === 'frequency' 
                                  ? `${Math.round(subject.total / examCount)}x`
                                  : viewData.formatValue(subject.rate)
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span>📊</span>
                              <span>{progressPercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <div className="text-base font-semibold text-gray-800 leading-snug mb-2">
                            {subject.subject}
                          </div>
                          
                          <div className="text-xs text-gray-500 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span>📚</span>
                              <span>{subject.className}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📝</span>
                              <span>Ort: {averageQuestions.toFixed(1)} soru</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">💡</span>
          <span className="text-base font-semibold text-gray-700">
            Analiz Bilgisi
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {selectedView === 'frequency' && 'Konular, sınav verilerinizde geçen sıklığına göre sıralanmıştır.'}
          {selectedView === 'mistakes' && 'Konular, ortalama hata yapma oranınıza göre sıralanmıştır. Yüksek oranlı konular daha fazla çalışma gerektirebilir.'}
          {selectedView === 'empty' && 'Konular, ortalama boş bırakma oranınıza göre sıralanmıştır. Bu konularda daha fazla pratik gerekebilir.'}
        </p>
      </div>
    </div>
  );
} 