import React, { useState, useEffect } from 'react';
import { SubjectGroupModalProps } from '../types';

export const SubjectGroupModal: React.FC<SubjectGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingGroup, 
  availableSubjects 
}) => {
  const [selectedLesson, setSelectedLesson] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (editingGroup) {
      setSelectedLesson(editingGroup.lesson);
      setGroupName(editingGroup.name);
      setSelectedSubjects(editingGroup.subjects);
    } else {
      setSelectedLesson('');
      setGroupName('');
      setSelectedSubjects([]);
    }
    setSearchTerm(''); // Reset search when opening/closing modal
  }, [editingGroup, isOpen]);

  const handleSave = () => {
    if (!selectedLesson || !groupName || selectedSubjects.length === 0) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    onSave({
      name: groupName,
      lesson: selectedLesson,
      subjects: selectedSubjects
    });

    setSelectedLesson('');
    setGroupName('');
    setSelectedSubjects([]);
    onClose();
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Filter subjects based on search term
  const getFilteredSubjects = (subjects: string[]) => {
    if (!searchTerm.trim()) return subjects;
    return subjects.filter(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingGroup ? '📝 Konu Grubunu Düzenle' : '➕ Yeni Konu Grubu Oluştur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Lesson Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Ders Seçin
            </label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Ders seçin...</option>
              {Object.keys(availableSubjects).map(lesson => (
                <option key={lesson} value={lesson}>{lesson}</option>
              ))}
            </select>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Grup Adı
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Örn: Geometri Temelleri, Tarih Analizi..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subject Multi-select */}
          {selectedLesson && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎯 Konular ({selectedSubjects.length} seçili)
              </label>
              
              {/* Search Input */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Konu ara..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🔍</span>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <span className="text-gray-400 hover:text-gray-600 text-sm">✕</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {availableSubjects[selectedLesson]?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Bu derste konu bulunamadı.</p>
                ) : (
                  (() => {
                    const filteredSubjects = getFilteredSubjects(availableSubjects[selectedLesson] || []);
                    return filteredSubjects.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        "{searchTerm}" araması için konu bulunamadı.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredSubjects.map(subject => (
                          <label key={subject} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{subject}</span>
                          </label>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={!selectedLesson || !groupName || selectedSubjects.length === 0}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {editingGroup ? '💾 Güncelle' : '✅ Oluştur'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ❌ İptal
          </button>
        </div>
      </div>
    </div>
  );
}; 