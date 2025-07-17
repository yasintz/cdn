import React, { useState } from 'react';
import { useStore } from '../../useStore';
import { ImportantSubjectsProps, SubjectGroup } from './types';
import { useSubjectGroups } from './hooks/useSubjectGroups';
import { useSubjectData } from './hooks/useSubjectData';
import { StatisticsCards } from './components/StatisticsCards';
import { LessonCard } from './components/LessonCard';
import { SubjectGroupModal } from './components/SubjectGroupModal';
import { SubjectDetailModal } from './components/SubjectDetailModal';



export function ImportantSubjects({
  data: { importantSubjects, examCount, analytics },
}: ImportantSubjectsProps) {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SubjectGroup | null>(null);
  const [isSubjectDetailModalOpen, setIsSubjectDetailModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  
  // Get exams from the store
  const { exams } = useStore();

  // Use custom hooks
  const { subjectGroups, saveGroup, deleteGroup, getGroupById } = useSubjectGroups();
  
  const {
    selectedView,
    setSelectedView,
    subjectCount,
    setSubjectCount,
    viewData,
    lessons,
    availableSubjects,
    getSubjectsForLesson,
    maxValue
  } = useSubjectData({
    importantSubjects,
    analytics,
    examCount,
    subjectGroups
  });

  // Event handlers
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: SubjectGroup) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>) => {
    saveGroup(groupData, editingGroup);
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
  };

  const handleSubjectClick = (subjectName: string, lessonName: string) => {
    setSelectedSubject(subjectName);
    setSelectedLesson(lessonName);
    setIsSubjectDetailModalOpen(true);
  };

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
            onChange={(e) => setSelectedView(e.target.value as any)}
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

          <button
            onClick={handleCreateGroup}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
          >
            <span>🔗</span>
            <span>Grup Oluştur</span>
          </button>
        </div>
      </div>

      {/* Subject Groups Management */}
      {subjectGroups.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🔗</span>
              <span>Konu Grupları ({subjectGroups.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectGroups.map(group => (
              <div key={group.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{group.name}</h4>
                    <p className="text-sm text-gray-600">{group.lesson}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {group.subjects.length} konu içeriyor
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {group.subjects.slice(0, 3).map(subject => (
                    <span key={subject} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {subject.length > 15 ? `${subject.substring(0, 15)}...` : subject}
                    </span>
                  ))}
                  {group.subjects.length > 3 && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      +{group.subjects.length - 3} daha
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <StatisticsCards 
        examCount={examCount} 
        viewData={viewData} 
        subjectGroups={subjectGroups} 
      />

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson}
            lesson={lesson}
            subjects={getSubjectsForLesson(lesson)}
            maxValue={maxValue}
            viewData={viewData}
            examCount={examCount}
            subjectGroups={subjectGroups}
            onSubjectClick={handleSubjectClick}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        ))}
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
          {selectedView === 'frequency' && 'Konular, sınav verilerinizde geçen sıklığına göre sıralanmıştır. Konu grupları birden fazla konuyu birleştirerek daha kapsamlı analiz sağlar.'}
          {selectedView === 'mistakes' && 'Konular, ortalama hata yapma oranınıza göre sıralanmıştır. Yüksek oranlı konular daha fazla çalışma gerektirebilir.'}
          {selectedView === 'empty' && 'Konular, ortalama boş bırakma oranınıza göre sıralanmıştır. Bu konularda daha fazla pratik gerekebilir.'}
        </p>
      </div>

      {/* Subject Group Modal */}
      <SubjectGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroup}
        editingGroup={editingGroup}
        availableSubjects={availableSubjects}
      />

      {/* Subject Detail Modal */}
      {selectedSubject && selectedLesson && (
        <SubjectDetailModal
          isOpen={isSubjectDetailModalOpen}
          onClose={() => setIsSubjectDetailModalOpen(false)}
          subjectName={selectedSubject}
          lessonName={selectedLesson}
          exams={exams}
          examCount={examCount}
        />
      )}
    </div>
  );
} 