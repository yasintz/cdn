import { Button } from '@/components/ui/button';
import { ArticleTypeEnum, useStore } from '../store';
import { useState } from 'react';
import { getPreviewHtml } from './preview';
import { Input } from '@/components/ui/input';
import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import TypeSelect from './TypeSelect';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedArticleId = searchParams.get('id');
  const { articles, addArticle, updateTitle, deleteArticle, updateArticle } =
    useStore();
  const [showEdit, setShowEdit] = useState(false);

  const selectedArticle =
    articles.find((article) => article.id === selectedArticleId) || articles[0];

  return (
    <div className="flex gap-2 p-4">
      <div className="flex flex-col gap-2 flex-1">
        {articles
          .filter((a) => a.id !== 'default')
          .map((article) => (
            <Button
              key={article.id}
              variant={
                selectedArticle.id === article.id ? 'default' : 'secondary'
              }
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('id', article.id);
                  return prev;
                })
              }
            >
              {_.truncate(article.title || '', { length: 20 }) || article.id}
            </Button>
          ))}
        <Button
          variant="outline"
          onClick={() =>
            addArticle({
              id: `m${Math.random().toString(36).substring(2, 8)}`,
              post: '',
              title: `Makale ${articles.length}`,
              postMd: '',
              type: ArticleTypeEnum.Ceza,
            })
          }
        >
          Makale Yaz <PlusIcon className="ml-2" size={16} />
        </Button>
      </div>
      <div style={{ flex: showEdit ? 15 : 6, height: window.innerHeight - 60 }}>
        {selectedArticle && (
          <>
            <div className="flex gap-2">
              <Input
                value={selectedArticle?.title}
                onChange={(e) =>
                  updateTitle(selectedArticle?.id || '', e.target.value)
                }
              />
              <TypeSelect article={selectedArticle} key={selectedArticleId} />
              {showEdit ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Geri Cik
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setShowEdit(true)}>Duzenle</Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteArticle(selectedArticle.id)}
                  >
                    Sil
                  </Button>
                </>
              )}
            </div>
            {showEdit ? (
              <div className="flex flex-col h-full w-full">
                <Header article={selectedArticle} key={selectedArticle.id} />

                <div className="flex flex-1">
                  <textarea
                    value={selectedArticle.postMd || ''}
                    onChange={(e) =>
                      updateArticle(selectedArticle.id, {
                        postMd: e.target.value,
                      })
                    }
                    className="flex-1 p-2 border-r"
                  />
                  <iframe
                    className="flex-1"
                    srcDoc={getPreviewHtml(selectedArticle?.post)}
                  />
                </div>
              </div>
            ) : (
              <iframe
                className="w-full h-full"
                srcDoc={getPreviewHtml(selectedArticle?.post)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
