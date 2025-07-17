export const lessonColors: Record<string, string> = {
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

export const lessonIcons: Record<string, string> = {
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

export const borderColors: Record<string, string> = {
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

export const answerIcons = {
  true: '✅',
  false: '❌',
  skip: '⭕',
  cancel: '🚫',
  default: '❓'
};

export const answerColors = {
  true: 'text-green-600 bg-green-50',
  false: 'text-red-600 bg-red-50',
  skip: 'text-gray-600 bg-gray-50',
  cancel: 'text-orange-600 bg-orange-50',
  default: 'text-gray-600 bg-gray-50'
};

export const viewTypeConfig = {
  frequency: {
    title: 'En Sık Karşılaşılan Konular',
    icon: '📊',
    description: 'Sınav verilerinde en sık geçen konular',
    color: 'bg-blue-500',
    colorClass: 'bg-blue-500',
    valueLabel: 'Toplam Soru'
  },
  mistakes: {
    title: 'En Çok Hata Yapılan Konular',
    icon: '❌',
    description: 'Ortalama hata oranına göre sıralanmış konular',
    color: 'bg-red-500',
    colorClass: 'bg-red-500',
    valueLabel: 'Hata Oranı'
  },
  empty: {
    title: 'En Çok Boş Bırakılan Konular',
    icon: '⭕',
    description: 'Ortalama boş bırakma oranına göre sıralanmış konular',
    color: 'bg-gray-500',
    colorClass: 'bg-gray-500',
    valueLabel: 'Boş Oranı'
  }
}; 