'use client';

import { useMemo, useState } from 'react';
import './App.css';
import { newImpl } from './new';
import { UserAnswer, dersler } from './modules/helpers';
import _ from 'lodash';
import { parseExam } from './modules/parseExam';
import { useStore } from './useStore';
import { Button } from '@/components/ui/Button';

function ImportantSubjects({
  data: { importantSubjects, examCount },
}: {
  data: ReturnType<typeof newImpl>;
}) {
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

function Analytics({
  data: { analytics, examCount },
}: {
  data: ReturnType<typeof newImpl>;
}) {
  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Analiz</h2>
      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Ders Bazli</h3>

        <div style={{ display: 'flex', gap: '4rem' }}>
          <div>
            <h4>Bos Birakilan</h4>
            {_.orderBy(analytics.lessonBasedData, ['skipRate'], ['desc']).map(
              (item) => (
                <div key={item.lesson} style={{ display: 'flex' }}>
                  <div style={{ width: 60 }}>
                    {item.count}/{(item.skipRate * item.count).toFixed(1)}:{' '}
                  </div>
                  {item.lesson}
                </div>
              )
            )}
          </div>
          <div>
            <h4>Yanlis Yapilan</h4>
            {_.orderBy(analytics.lessonBasedData, ['falseRate'], ['desc']).map(
              (item) => (
                <div key={item.lesson} style={{ display: 'flex' }}>
                  <div style={{ width: 60 }}>
                    {item.count}/{(item.falseRate * item.count).toFixed(1)}:{' '}
                  </div>
                  {item.lesson}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Konu Bazli</h3>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {([UserAnswer.Skip, UserAnswer.False] as const).map((key) => (
            <div key={key}>
              <h4>
                {key === UserAnswer.Skip ? 'Bos Birakilan' : 'Yanlis Yapilan'}
              </h4>
              {analytics.subjectBasedData[key]
                .filter((i) => i.subject)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.subject + item.className}
                    style={{ display: 'flex' }}
                  >
                    <div style={{ width: 44 }}>
                      {item.total}/{item.matched}:{' '}
                    </div>
                    ({item.className}) {item.subject}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Ortalama</h3>

        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
          {analytics.answerCounts.map(({ count, data, lesson }) => (
            <div key={lesson}>
              <h4>{lesson}</h4>
              <div>
                {`Dogru: ${count}/${(data.True / examCount).toFixed(1)}`}
              </div>
              <div>
                {`Yanlis: ${count}/${(data.False / examCount).toFixed(1)}`}
              </div>
              <div>{`Bos: ${count}/${(data.Skip / examCount).toFixed(1)}`}</div>
              <div>---</div>
              <div>
                {`Net: ${count}/${(count * data.SuccessRate).toFixed(1)}`}
              </div>
              <div>
                {`Basari Orani: 100/${Math.floor(data.SuccessRate * 100)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AddExam({ onSuccess }: { onSuccess: () => void }) {
  const { exams, addExam } = useStore();
  const [examNumber, setExamNumber] = useState(
    (parseInt(exams[exams.length - 1]?.id || '0', 10) + 1).toString()
  );
  const [value, setValue] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const response = useMemo(() => {
    try {
      // return value ? parseExam(`${examNumber}\n${value}`) : undefined;
      if (value) {
        const exam = parseExam(examNumber, value);
        const result = newImpl([exam]);

        return { exam, result };
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }, [value, examNumber]);

  const showUserAnswer: Record<UserAnswer, string> = {
    [UserAnswer.Cancel]: 'IPT',
    [UserAnswer.False]: '-',
    [UserAnswer.Skip]: '',
    [UserAnswer.True]: '+',
    [UserAnswer.Invalid]: '??',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <a
        href="https://drive.google.com/file/d/1trEqAMhrrWS9z8nwf9HpvZaSczRs8bpe/view?usp=sharing"
        style={{ fontSize: '20px', margin: '12px 0 12px' }}
        className="text-blue-500"
        target="_blank"
      >
        Sinavimi Nasil Kopyalarim
      </a>
      <div style={{ marginBottom: '12px' }}>
        Daha once eklenen sinavlar: {exams.map((i) => i.id).join(', ')}
      </div>
      <input
        value={examNumber}
        onChange={(e) => setExamNumber(e.target.value)}
        placeholder="Sinav Numarasi"
        className="border"
        style={{
          fontSize: 16,
          borderRadius: '8px',
          padding: '0.7rem',
        }}
      />
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border"
        style={{
          margin: '1rem 0 1rem',
          borderRadius: '8px',
          padding: '1rem',
          height: '400px',
        }}
      />

      <Button
        style={{ width: '100%' }}
        onClick={() => {
          if (showResponse && response) {
            addExam(response.exam);
            onSuccess();
            return;
          }

          setShowResponse(true);
        }}
      >
        {showResponse ? 'Kaydet' : 'Goruntule'}
      </Button>
      {showResponse && response && (
        <>
          <table style={{ margin: '1rem 0 1rem' }}>
            <thead>
              <tr>
                <th>Ders</th>
                <th>Soru</th>
                <th>Dogru</th>
                <th>Yanlis</th>
                <th>Bos</th>
                <th>Net</th>
                <th>ORT</th>
              </tr>
            </thead>
            <tbody>
              {dersler.map((ders) => {
                const data = response.result.analytics.lessonBasedData.find(
                  (i) => i.lesson === ders.name
                )?.data;

                return (
                  <tr key={ders.name}>
                    <td data-no-center>{ders.name}</td>
                    <td>{ders.count}</td>
                    <td>{data?.[UserAnswer.True]}</td>
                    <td>{data?.[UserAnswer.False]}</td>
                    <td>{data?.[UserAnswer.Skip]}</td>
                    <td>{data?.Net}</td>
                    <td />
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3 className="center">Konu Analizi</h3>
          {dersler.map((ders) => (
            <table key={ders.name} style={{ margin: '1rem 0 1rem' }}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Konu</th>
                  <th>DC</th>
                  <th>OC</th>
                  <th>SO</th>
                  <th>CZM</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#5484c3' }}>
                  <td colSpan={6}>{ders.name}</td>
                </tr>
                {Object.entries(response.exam.sinav[ders.name]).map(
                  ([no, result]) => (
                    <tr key={result.question + no}>
                      <td>{no}</td>
                      <td data-no-center>{result.question}</td>
                      <td>{result.rightAnswer}</td>
                      <td>{result.givenAnswer}</td>
                      <td
                        style={{
                          backgroundColor:
                            result.answer === UserAnswer.False
                              ? '#f74e4e'
                              : undefined,
                        }}
                      >
                        {showUserAnswer[result.answer]}
                      </td>
                      <td></td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ))}
        </>
      )}
    </div>
  );
}

function App() {
  const [page, setPage] = useState<
    'analytics' | 'important-subjects' | 'add-exam'
  >('analytics');
  const { exams } = useStore();
  const [time, setTime] = useState((exams.length - 1).toString());
  const data = useMemo(
    () => newImpl(exams.slice(0, parseInt(time, 10) + 1)),
    [exams, time]
  );

  const pages: Record<typeof page, React.ReactNode> = {
    analytics: <Analytics data={data} />,
    'important-subjects': <ImportantSubjects data={data} />,
    'add-exam': <AddExam onSuccess={() => setPage('analytics')} />,
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <Button onClick={() => setPage('important-subjects')}>
          Onemli Konular
        </Button>
        <Button onClick={() => setPage('analytics')}>Analiz</Button>
        <Button onClick={() => setPage('add-exam')}>Sinav Ekle</Button>
      </div>
      {page === 'analytics' && (
        <div style={{ marginTop: '2rem' }}>
          <input
            id="input"
            type="range"
            min="0"
            value={time}
            style={{ width: '100%' }}
            onChange={(e) => setTime(e.target.value)}
            max={exams.length - 1}
            step="1"
          />
        </div>
      )}
      {pages[page]}
    </>
  );
}

export default App;
