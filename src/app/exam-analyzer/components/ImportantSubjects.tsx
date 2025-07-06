import { dersler } from '../modules/helpers';
import { newImpl } from '../new';

interface ImportantSubjectsProps {
  data: ReturnType<typeof newImpl>;
}

export function ImportantSubjects({
  data: { importantSubjects, examCount },
}: ImportantSubjectsProps) {
  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Onemli Konular</h2>
      <div
        style={{
          borderTop: '1px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
        }}
      >
        {[...dersler.map((i) => i.name), 'Tum Dersler'].map((item) => (
          <div key={item} style={{ marginBottom: '1rem' }}>
            <h4>{item}</h4>
            {(item === 'Tum Dersler'
              ? importantSubjects.subjectCounts.inAllClass
              : importantSubjects.subjectCounts.byClass[item]
            )
              ?.filter((i) => i.subject)
              .slice(0, 5)
              .map((i) => (
                <div key={i.className + i.subject}>
                  {Math.round(i.total / examCount)}: {i.subject}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
} 