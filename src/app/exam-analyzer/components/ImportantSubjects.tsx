import { dersler } from '../modules/helpers';
import { newImpl } from '../new';
import { UserAnswer } from '../modules/helpers';
import { useState, useEffect } from 'react';

interface ImportantSubjectsProps {
  data: ReturnType<typeof newImpl>;
}

type ViewType = 'frequency' | 'mistakes' | 'empty';

interface SubjectGroup {
  id: string;
  name: string;
  lesson: string;
  subjects: string[];
  createdAt: number;
}

interface SubjectData {
  subject: string;
  className: string;
  total?: number;
  rate?: number;
  displayValue: number;
  progressValue: number;
  isGroup: boolean;
  groupId?: string;
  groupSubjects?: string[];
}

interface SubjectGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<SubjectGroup, 'id' | 'createdAt'>) => void;
  editingGroup?: SubjectGroup | null;
  availableSubjects: { [lesson: string]: string[] };
}

function SubjectGroupModal({ isOpen, onClose, onSave, editingGroup, availableSubjects }: SubjectGroupModalProps) {
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
}

export function ImportantSubjects({
  data: { importantSubjects, examCount, analytics },
}: ImportantSubjectsProps) {
  const [selectedView, setSelectedView] = useState<ViewType>('frequency');
  const [subjectCount, setSubjectCount] = useState<number>(5);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SubjectGroup | null>(null);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);

  // Load subject groups from localStorage on component mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('subjectGroups');
    if (savedGroups) {
      try {
        setSubjectGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Error loading subject groups:', error);
      }
    }
  }, []);

  // Save subject groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('subjectGroups', JSON.stringify(subjectGroups));
  }, [subjectGroups]);

  // Get available subjects for each lesson
  const getAvailableSubjects = () => {
    const availableSubjects: { [lesson: string]: string[] } = {};
    
    Object.keys(importantSubjects.subjectCounts.byClass).forEach(lesson => {
      const subjects = importantSubjects.subjectCounts.byClass[lesson]
        ?.map(item => item.subject)
        .filter(Boolean) || [];
      availableSubjects[lesson] = [...new Set(subjects)];
    });
    
    return availableSubjects;
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: SubjectGroup) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>) => {
    if (editingGroup) {
      // Update existing group
      setSubjectGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...groupData }
          : group
      ));
    } else {
      // Create new group
      const newGroup: SubjectGroup = {
        ...groupData,
        id: Date.now().toString(),
        createdAt: Date.now()
      };
      setSubjectGroups(prev => [...prev, newGroup]);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Bu konu grubunu silmek istediğinizden emin misiniz?')) {
      setSubjectGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  // Calculate group data based on its subjects
  const calculateGroupData = (group: SubjectGroup): SubjectData | null => {
    const groupSubjects = group.subjects;
    
    if (selectedView === 'frequency') {
      const lessonData = importantSubjects.subjectCounts.byClass[group.lesson] || [];
      const relevantSubjects = lessonData.filter(item => groupSubjects.includes(item.subject));
      
      const totalQuestions = relevantSubjects.reduce((sum, item) => sum + item.total, 0);
      const avgPerExam = totalQuestions / examCount;
      
      return {
        subject: group.name,
        className: group.lesson,
        total: totalQuestions,
        rate: avgPerExam,
        displayValue: Math.round(avgPerExam),
        progressValue: totalQuestions,
        isGroup: true,
        groupId: group.id,
        groupSubjects: group.subjects
      };
    } else {
      const analyticsData = selectedView === 'mistakes' 
        ? analytics.subjectBasedData[UserAnswer.False]
        : analytics.subjectBasedData[UserAnswer.Skip];
      
      const relevantSubjects = analyticsData?.filter(item => 
        item.className === group.lesson && groupSubjects.includes(item.subject)
      ) || [];
      
      if (relevantSubjects.length === 0) return null;
      
      const avgRate = relevantSubjects.reduce((sum, item) => sum + item.rate, 0) / relevantSubjects.length;
      
      return {
        subject: group.name,
        className: group.lesson,
        rate: avgRate,
        displayValue: avgRate,
        progressValue: avgRate,
        isGroup: true,
        groupId: group.id,
        groupSubjects: group.subjects
      };
    }
  };

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

  // Group data by lesson including subject groups
  const getSubjectsByLesson = (lesson: string): SubjectData[] => {
    let regularSubjects: SubjectData[] = [];
    let groupSubjects: SubjectData[] = [];

    // Get regular subjects
    if (selectedView === 'frequency') {
      const subjects = (lesson === 'Tum Dersler'
        ? importantSubjects.subjectCounts.inAllClass
        : importantSubjects.subjectCounts.byClass[lesson]
      )?.filter((i) => i.subject) || [];
      
      regularSubjects = subjects.map(subject => ({
        ...subject,
        rate: subject.total / examCount,
        displayValue: Math.round(subject.total / examCount),
        progressValue: subject.total,
        isGroup: false
      }));
    } else {
      const allSubjects = viewData.data.filter(subject => 
        lesson === 'Tum Dersler' || subject.className === lesson
      );
      
      regularSubjects = allSubjects.map(subject => ({
        ...subject,
        displayValue: subject.rate,
        progressValue: subject.rate,
        isGroup: false
      }));
    }

    // Get subject groups for this lesson
    const lessonGroups = lesson === 'Tum Dersler' 
      ? subjectGroups 
      : subjectGroups.filter(group => group.lesson === lesson);

    groupSubjects = lessonGroups
      .map(group => calculateGroupData(group))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    // Combine and sort
    const allSubjects = [...regularSubjects, ...groupSubjects];
    
    // Sort by the appropriate value and take top subjects
    const sortKey = selectedView === 'frequency' ? 'progressValue' : 'rate';
    const sortedSubjects = allSubjects
      .sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0))
      .slice(0, subjectCount);

    return sortedSubjects;
  };

  // Calculate max values for progress bars
  const getAllSubjects = (): SubjectData[] => {
    const allSubjects = lessons.flatMap(lesson => getSubjectsByLesson(lesson));
    return allSubjects;
  };

  const allSubjects = getAllSubjects();
  const maxValue = Math.max(...allSubjects.map(s => s.progressValue || 0));

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

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="text-3xl mb-2">🔗</div>
          <div className="text-3xl font-bold mb-1">
            {subjectGroups.length}
          </div>
          <div className="text-sm opacity-90">
            Konu Grubu
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
                    const averageQuestions = subject.total ? subject.total / examCount : 0;
                    
                    return (
                      <div 
                        key={`${subject.className}-${subject.subject}-${subject.isGroup ? 'group' : 'regular'}`}
                        className={`bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden ${
                          subject.isGroup ? 'border-green-300 bg-green-50' : ''
                        }`}
                      >
                        {/* Progress Background */}
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            subject.isGroup ? 'bg-green-500/20' : `${viewData.colorClass}/20`
                          } rounded-xl transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`${
                                subject.isGroup ? 'bg-green-500' : viewData.colorClass
                              } text-white px-2 py-1 rounded-2xl text-xs font-bold min-w-8 text-center`}>
                                #{index + 1}
                              </span>
                              {subject.isGroup && (
                                <span className="text-green-600 text-xs font-semibold">🔗 GRUP</span>
                              )}
                              <span className={`${getBorderColor(lesson)}/20 ${getBorderColor(lesson).replace('border-', 'text-')} px-3 py-1 rounded-2xl text-xs font-semibold`}>
                                {selectedView === 'frequency' 
                                  ? `${Math.round((subject.total || 0) / examCount)}x`
                                  : viewData.formatValue(subject.rate || subject.displayValue)
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                                                             {subject.isGroup && subject.groupId && (
                                 <div className="flex gap-1">
                                   <button
                                     onClick={() => {
                                       const group = subjectGroups.find(g => g.id === subject.groupId);
                                       if (group) handleEditGroup(group);
                                     }}
                                     className="text-blue-500 hover:text-blue-700 text-xs p-1"
                                     title="Grubu Düzenle"
                                   >
                                     ✏️
                                   </button>
                                   <button
                                     onClick={() => {
                                       if (subject.groupId) handleDeleteGroup(subject.groupId);
                                     }}
                                     className="text-red-500 hover:text-red-700 text-xs p-1"
                                     title="Grubu Sil"
                                   >
                                     🗑️
                                   </button>
                                 </div>
                               )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>📊</span>
                                <span>{progressPercentage.toFixed(1)}%</span>
                              </div>
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
                              {subject.isGroup ? (
                                <>
                                  <span>🔗</span>
                                  <span>{subject.groupSubjects?.length || 0} konu</span>
                                </>
                              ) : (
                                <>
                                  <span>📝</span>
                                  <span>Ort: {averageQuestions.toFixed(1)} soru</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Show grouped subjects */}
                          {subject.isGroup && subject.groupSubjects && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <div className="text-xs text-gray-600 font-semibold mb-2">Grup İçeriği:</div>
                              <div className="flex flex-wrap gap-1">
                                {subject.groupSubjects.slice(0, 4).map((groupSubject: string) => (
                                  <span key={groupSubject} className="text-xs bg-white px-2 py-1 rounded border">
                                    {groupSubject.length > 12 ? `${groupSubject.substring(0, 12)}...` : groupSubject}
                                  </span>
                                ))}
                                {subject.groupSubjects.length > 4 && (
                                  <span className="text-xs bg-white px-2 py-1 rounded border">
                                    +{subject.groupSubjects.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
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
        availableSubjects={getAvailableSubjects()}
      />
    </div>
  );
} 