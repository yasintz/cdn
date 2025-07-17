import React, { useState, useMemo } from 'react';
import { useStore } from '../useStore';
import { newImpl } from '../new';
import { Button } from '@/components/ui/button';
import { SubjectGroup } from './ImportantSubjects/types';
import { useSubjectGroups } from './ImportantSubjects/hooks/useSubjectGroups';
import { getAvailableSubjects } from './ImportantSubjects/utils/subjectDataUtils';
import { SubjectGroupModal } from './ImportantSubjects/components/SubjectGroupModal';
import { useModalState } from './ImportantSubjects/hooks/useModalState';

export function SubjectGroups() {
  const { exams } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  
  // Get subject groups management
  const { subjectGroups, saveGroup, deleteGroup } = useSubjectGroups();
  const modalState = useModalState();
  
  // Get data from the store to show available subjects
  const data = useMemo(() => newImpl(exams), [exams]);
  const { importantSubjects } = data;
  
  // Get available subjects for group creation
  const availableSubjects = useMemo(() => {
    if (!importantSubjects) return {};
    return getAvailableSubjects(importantSubjects);
  }, [importantSubjects]);
  
  // Filter groups based on search and lesson
  const filteredGroups = useMemo(() => {
    return subjectGroups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLesson = selectedLesson === 'all' || group.lesson === selectedLesson;
      return matchesSearch && matchesLesson;
    });
  }, [subjectGroups, searchTerm, selectedLesson]);
  
  // Get all lessons from available subjects
  const allLessons = useMemo(() => {
    return Object.keys(availableSubjects).sort();
  }, [availableSubjects]);
  
  // Statistics
  const stats = useMemo(() => {
    const totalGroups = subjectGroups.length;
    const totalSubjectsInGroups = subjectGroups.reduce((sum, group) => sum + group.subjects.length, 0);
    const lessonDistribution = subjectGroups.reduce((acc, group) => {
      acc[group.lesson] = (acc[group.lesson] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalGroups,
      totalSubjectsInGroups,
      lessonDistribution
    };
  }, [subjectGroups]);

  const handleEditGroup = (group: SubjectGroup) => {
    modalState.openGroupModal(group);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Bu konu grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteGroup(groupId);
    }
  };

  const handleCreateGroup = () => {
    modalState.openGroupModal();
  };

  const handleSaveGroup = (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroup?: SubjectGroup | null) => {
    try {
      saveGroup(groupData, editingGroup);
      modalState.closeGroupModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Grup kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 p-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-2xl">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">
          Konu Grupları Yönetimi
        </h1>
        <p className="text-lg opacity-90 font-light mb-6">
          Konuları gruplandırarak analiz sürecinizi organize edin
        </p>
        
        <Button
          onClick={handleCreateGroup}
          className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-none shadow-lg"
        >
          ➕ Yeni Grup Oluştur
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Toplam Grup</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalGroups}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Gruplanmış Konu</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalSubjectsInGroups}</p>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">En Çok Grup</p>
              <p className="text-lg font-bold text-gray-800">
                {Object.entries(stats.lessonDistribution).length > 0 
                  ? Object.entries(stats.lessonDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'Henüz yok'
                }
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Grup veya konu adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-colors"
            />
          </div>
          <div>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none min-w-[150px]"
            >
              <option value="all">Tüm Dersler</option>
              {allLessons.map(lesson => (
                <option key={lesson} value={lesson}>{lesson}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 px-8 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-medium text-gray-600 mb-4">
            {subjectGroups.length === 0 ? 'Henüz grup oluşturulmamış' : 'Arama kriterlerine uygun grup bulunamadı'}
          </h2>
          <p className="text-gray-500 text-base mb-6">
            {subjectGroups.length === 0 
              ? 'İlk konu grubunuzu oluşturarak başlayın' 
              : 'Farklı arama kriterleri deneyin'
            }
          </p>
          {subjectGroups.length === 0 && (
            <Button
              onClick={handleCreateGroup}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors border-none"
            >
              ➕ İlk Grubunu Oluştur
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={() => handleEditGroup(group)}
              onDelete={() => handleDeleteGroup(group.id)}
            />
          ))}
        </div>
      )}

      {/* Subject Group Modal */}
      <SubjectGroupModal
        isOpen={modalState.isGroupModalOpen}
        onClose={modalState.closeGroupModal}
        onSave={handleSaveGroup}
        editingGroup={modalState.editingGroup}
        availableSubjects={availableSubjects}
      />
    </div>
  );
}

// Group Card Component
interface GroupCardProps {
  group: SubjectGroup;
  onEdit: () => void;
  onDelete: () => void;
}

function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLessonColor = (lesson: string) => {
    const colors: Record<string, string> = {
      'Türkçe': 'bg-blue-100 text-blue-800',
      'Matematik': 'bg-purple-100 text-purple-800',
      'Tarih': 'bg-orange-100 text-orange-800',
      'Coğrafya': 'bg-green-100 text-green-800',
      'Felsefe': 'bg-pink-100 text-pink-800',
      'Din Kültürü': 'bg-lime-100 text-lime-800',
      'Fizik': 'bg-teal-100 text-teal-800',
      'Kimya': 'bg-yellow-100 text-yellow-800',
      'Biyoloji': 'bg-purple-100 text-purple-800',
      'Geometri': 'bg-indigo-100 text-indigo-800'
    };
    return colors[lesson] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{group.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getLessonColor(group.lesson)}`}>
            {group.lesson}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Düzenle"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {group.subjects.length} konu içeriyor
        </p>
        <div className="flex flex-wrap gap-1">
          {group.subjects.slice(0, 4).map(subject => (
            <span 
              key={subject} 
              className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
              title={subject}
            >
              {subject.length > 20 ? `${subject.substring(0, 20)}...` : subject}
            </span>
          ))}
          {group.subjects.length > 4 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              +{group.subjects.length - 4} daha
            </span>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
        Oluşturulma: {formatDate(group.createdAt)}
      </div>
    </div>
  );
} 