import React, { useState, useMemo } from 'react';
import { useStore } from '../useStore';
import { newImpl } from '../new';
import { getAvailableSubjects, getLessons } from './ImportantSubjects/utils/subjectDataUtils';
import { useModalState } from './ImportantSubjects/hooks/useModalState';
import { SubjectDetailModal } from './ImportantSubjects/components/SubjectDetailModal';
import { Button } from '@/components/ui/button';

export function AllSubjects() {
  const { exams } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  
  // Get data from the store
  const data = useMemo(() => newImpl(exams), [exams]);
  const { importantSubjects, examCount } = data;
  
  // Get modal state for subject details
  const modalState = useModalState();
  
  // Get all subjects organized by lesson
  const availableSubjects = useMemo(() => {
    if (!importantSubjects) return {};
    return getAvailableSubjects(importantSubjects);
  }, [importantSubjects]);
  
  // Get lessons list
  const lessons = useMemo(() => getLessons(), []);
  
  // Filter subjects based on search term and selected lesson
  const filteredSubjects = useMemo(() => {
    const filtered: { [lesson: string]: string[] } = {};
    
    Object.entries(availableSubjects).forEach(([lesson, subjects]) => {
      // Filter by lesson if not 'all'
      if (selectedLesson !== 'all' && lesson !== selectedLesson) {
        return;
      }
      
      // Filter by search term
      const searchFiltered = subjects.filter(subject =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (searchFiltered.length > 0) {
        filtered[lesson] = searchFiltered;
      }
    });
    
    return filtered;
  }, [availableSubjects, searchTerm, selectedLesson]);
  
  // Get subject count for a specific subject and lesson
  const getSubjectCount = (subjectName: string, lessonName: string) => {
    const lessonData = importantSubjects?.subjectCounts?.byClass?.[lessonName] || [];
    const subjectData = lessonData.find((item: any) => item.subject === subjectName);
    return subjectData?.total || 0;
  };
  
  // Handle subject click
  const handleSubjectClick = (subjectName: string, lessonName: string) => {
    modalState.openSubjectDetailModal(subjectName, lessonName);
  };
  
  // Get lesson color
  const getLessonColor = (lesson: string) => {
    const colors: Record<string, string> = {
      'Türkçe': 'bg-blue-50 border-blue-200',
      'Matematik': 'bg-purple-50 border-purple-200',
      'Tarih': 'bg-orange-50 border-orange-200',
      'Coğrafya': 'bg-green-50 border-green-200',
      'Felsefe': 'bg-pink-50 border-pink-200',
      'Din Kültürü': 'bg-lime-50 border-lime-200',
      'Fizik': 'bg-teal-50 border-teal-200',
      'Kimya': 'bg-yellow-50 border-yellow-200',
      'Biyoloji': 'bg-indigo-50 border-indigo-200',
      'Geometri': 'bg-violet-50 border-violet-200'
    };
    return colors[lesson] || 'bg-gray-50 border-gray-200';
  };
  
  // Calculate total subject count
  const totalSubjectsCount = Object.values(filteredSubjects).reduce(
    (total, subjects) => total + subjects.length, 
    0
  );
  
  if (!importantSubjects || examCount === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Henüz sınav verisi bulunmuyor
          </h3>
          <p className="text-gray-600">
            Konuları görüntülemek için önce sınav ekleyin.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tüm Konular
        </h1>
        <p className="text-gray-600">
          {totalSubjectsCount} konu • {examCount} sınav verisi
        </p>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Konu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Lesson Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedLesson('all')}
            variant={selectedLesson === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            Tüm Dersler
          </Button>
          {lessons.filter(lesson => lesson !== 'Tum Dersler').map((lesson) => (
            <Button
              key={lesson}
              onClick={() => setSelectedLesson(lesson)}
              variant={selectedLesson === lesson ? 'default' : 'outline'}
              size="sm"
            >
              {lesson}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Results Summary */}
      {searchTerm && (
        <div className="mb-6 text-sm text-gray-600">
          "{searchTerm}" için {totalSubjectsCount} sonuç bulundu
        </div>
      )}
      
      {/* Subjects by Lesson */}
      {Object.keys(filteredSubjects).length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-gray-600">
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredSubjects)
            .sort(([a], [b]) => a.localeCompare(b, 'tr'))
            .map(([lesson, subjects]) => (
              <div
                key={lesson}
                className={`rounded-lg border-2 p-6 ${getLessonColor(lesson)}`}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{lesson}</span>
                  <span className="text-sm font-normal text-gray-600 bg-white px-2 py-1 rounded-full">
                    {subjects.length} konu
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {subjects
                    .sort((a, b) => a.localeCompare(b, 'tr'))
                    .map((subject) => {
                      const totalCount = getSubjectCount(subject, lesson);
                      const averagePerExam = examCount > 0 ? totalCount / examCount : 0;
                      
                      return (
                        <div
                          key={`${lesson}-${subject}`}
                          onClick={() => handleSubjectClick(subject, lesson)}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex flex-col">
                            <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {subject}
                            </h3>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex justify-between">
                                <span>Toplam:</span>
                                <span className="font-medium">{totalCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ortalama:</span>
                                <span className="font-medium">{averagePerExam.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Subject Detail Modal */}
      <SubjectDetailModal
        isOpen={modalState.isSubjectDetailModalOpen}
        onClose={modalState.closeSubjectDetailModal}
        subjectName={modalState.selectedSubject}
        lessonName={modalState.selectedLesson}
        exams={exams}
        examCount={examCount}
      />
    </div>
  );
} 