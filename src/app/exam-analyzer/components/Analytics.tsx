import _ from 'lodash';
import { UserAnswer } from '../modules/helpers';
import { newImpl } from '../new';

interface AnalyticsProps {
  data: ReturnType<typeof newImpl>;
}

export function Analytics({
  data: { analytics, examCount },
}: AnalyticsProps) {
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