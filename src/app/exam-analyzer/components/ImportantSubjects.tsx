import { dersler } from '../modules/helpers';
import { newImpl } from '../new';

interface ImportantSubjectsProps {
  data: ReturnType<typeof newImpl>;
}

export function ImportantSubjects({
  data: { importantSubjects, examCount },
}: ImportantSubjectsProps) {
  const lessonColors: Record<string, string> = {
    'Türkçe': '#e3f2fd',
    'Matematik': '#f3e5f5',
    'Tarih': '#fff3e0',
    'Coğrafya': '#e8f5e8',
    'Felsefe': '#fce4ec',
    'Din Kültürü': '#f1f8e9',
    'Fizik': '#e0f2f1',
    'Kimya': '#fff8e1',
    'Biyoloji': '#f3e5f5',
    'Geometri': '#e8eaf6',
    'Tum Dersler': '#f8f9fa'
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
      'Türkçe': '#2196f3',
      'Matematik': '#9c27b0',
      'Tarih': '#ff9800',
      'Coğrafya': '#4caf50',
      'Felsefe': '#e91e63',
      'Din Kültürü': '#8bc34a',
      'Fizik': '#00bcd4',
      'Kimya': '#ffc107',
      'Biyoloji': '#9c27b0',
      'Geometri': '#3f51b5',
      'Tum Dersler': '#6c757d'
    };
    return colors[lesson] || '#6c757d';
  };

  const getIntensityColor = (frequency: number, maxFrequency: number) => {
    const ratio = frequency / maxFrequency;
    if (ratio >= 0.8) return '#d32f2f'; // High intensity - red
    if (ratio >= 0.6) return '#f57c00'; // Medium-high - orange
    if (ratio >= 0.4) return '#fbc02d'; // Medium - yellow
    if (ratio >= 0.2) return '#689f38'; // Low-medium - light green
    return '#388e3c'; // Low intensity - green
  };

  const lessons = [...dersler.map((i) => i.name), 'Tum Dersler'];

  // Calculate max frequency for intensity coloring
  const allSubjects = lessons.flatMap(lesson => 
    (lesson === 'Tum Dersler'
      ? importantSubjects.subjectCounts.inAllClass
      : importantSubjects.subjectCounts.byClass[lesson]
    )?.filter((i) => i.subject) || []
  );
  const maxFrequency = Math.max(...allSubjects.map(subject => Math.round(subject.total / examCount)));

  if (examCount === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
        <h2 style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '1.5rem' }}>
          Önemli Konular
        </h2>
        <p style={{ margin: '0', color: '#6c757d', fontSize: '1rem' }}>
          Analiz için en az bir sınav verisi gerekiyor.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
        <h1 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '2.5rem', 
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          Önemli Konular
        </h1>
        <p style={{ 
          margin: '0', 
          fontSize: '1.1rem', 
          opacity: 0.9,
          fontWeight: '300'
        }}>
          {examCount} sınav verisi analiz edilerek en sık karşılaşılan konular
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {examCount}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Toplam Sınav
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {allSubjects.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Toplam Konu
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #54a0ff 0%, #2e86de 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(84, 160, 255, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {lessons.length - 1}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Ders Alanı
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '2rem',
      }}>
        {lessons.map((lesson) => {
          const subjects = (lesson === 'Tum Dersler'
            ? importantSubjects.subjectCounts.inAllClass
            : importantSubjects.subjectCounts.byClass[lesson]
          )?.filter((i) => i.subject)?.slice(0, 5) || [];

          if (subjects.length === 0) return null;

          return (
            <div 
              key={lesson} 
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '0',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: `3px solid ${getBorderColor(lesson)}`,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {/* Card Header */}
              <div style={{
                background: `linear-gradient(135deg, ${getBorderColor(lesson)}15 0%, ${getBorderColor(lesson)}05 100%)`,
                padding: '1.5rem',
                borderBottom: `2px solid ${getBorderColor(lesson)}20`,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '3rem',
                  opacity: 0.1
                }}>
                  {lessonIcons[lesson]}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.8rem' }}>
                    {lessonIcons[lesson]}
                  </span>
                  <h3 style={{ 
                    margin: '0',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#2c3e50'
                  }}>
                    {lesson}
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#6c757d'
                }}>
                  <span>📈</span>
                  <span>{subjects.length} önemli konu</span>
                </div>
              </div>

              {/* Subjects List */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {subjects.map((subject, index) => {
                    const frequency = Math.round(subject.total / examCount);
                    const progressPercentage = (frequency / maxFrequency) * 100;
                    
                    return (
                      <div 
                        key={`${subject.className}-${subject.subject}`}
                        style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid #e9ecef',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Progress Background */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${progressPercentage}%`,
                          height: '100%',
                          background: `linear-gradient(135deg, ${getIntensityColor(frequency, maxFrequency)}20 0%, ${getIntensityColor(frequency, maxFrequency)}10 100%)`,
                          borderRadius: '12px',
                          transition: 'width 0.5s ease'
                        }} />

                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{
                                background: getIntensityColor(frequency, maxFrequency),
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '16px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                minWidth: '2rem',
                                textAlign: 'center'
                              }}>
                                #{index + 1}
                              </span>
                              <span style={{
                                background: `${getBorderColor(lesson)}20`,
                                color: getBorderColor(lesson),
                                padding: '0.25rem 0.75rem',
                                borderRadius: '16px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {frequency}x
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              color: '#6c757d'
                            }}>
                              <span>📊</span>
                              <span>{progressPercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            lineHeight: '1.4',
                            marginBottom: '0.25rem'
                          }}>
                            {subject.subject}
                          </div>
                          
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#6c757d',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>📚</span>
                            <span>{subject.className}</span>
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
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#495057' }}>
            Analiz Bilgisi
          </span>
        </div>
        <p style={{ 
          margin: '0', 
          fontSize: '0.9rem', 
          color: '#6c757d',
          lineHeight: '1.4'
        }}>
          Konular, sınav verilerinizde geçen sıklığına göre sıralanmıştır. 
          Yüksek sıklıktaki konular daha fazla çalışma gerektirebilir.
        </p>
      </div>
    </div>
  );
} 