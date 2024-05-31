import { Button } from '@/components/ui/button';
import { useStore } from '../store';
import { useRef, useState } from 'react';
import { getPreviewHtml } from './preview';
import { Input } from '@/components/ui/input';
import _, { uniqueId } from 'lodash';
import { PlusIcon, UploadIcon } from 'lucide-react';
import { cloudinary } from './cloudinary';
import Loading from '@/components/ui/loading';

const HomePage = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>();
  const { articles, addArticle, updateTitle, deleteArticle, updateArticle } =
    useStore();
  const [showEdit, setShowEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const selectedArticle =
    articles.find((article) => article.id === selectedArticleId) || articles[0];

  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const addToMarkdown = (str: string) => {
    updateArticle(
      selectedArticle.id,
      `${selectedArticle.postMd || ''}\n${str}`
    );
  };

  const onFileUpload = async () => {
    try {
      setImageUploading(true);
      const file = fileInputRef.current?.files?.[0];
      const uploadedFile = await cloudinary.upload(file!);
      addToMarkdown(`![image.png](${uploadedFile?.url})`);
    } catch (error) {
      alert('Islem Basarisiz');
    }
    setImageUploading(false);
  };

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
              onClick={() => setSelectedArticleId(article.id)}
            >
              {_.truncate(article.title || '', { length: 20 }) || article.id}
            </Button>
          ))}
        <Button
          variant="outline"
          onClick={() =>
            addArticle({
              id: `makale-${uniqueId('m')}`,
              post: '',
              title: `Makale ${articles.length}`,
              postMd: '',
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
                  {typeof selectedArticle.postMd === 'string' && (
                    <Button onClick={() => setShowEdit(true)}>Duzenle</Button>
                  )}
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
                <div className="flex my-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleUploadImageClick}
                    disabled={imageUploading}
                  >
                    {imageUploading ? (
                      <Loading className="mr-2 size-4" />
                    ) : (
                      <UploadIcon className="mr-2" size={16} />
                    )}{' '}
                    Resim Yukle
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => addToMarkdown('# Baslik')}
                  >
                    Buyuk Baslik Ekle
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => addToMarkdown('### Kucuk Baslik')}
                  >
                    Kucuk Baslik Ekle
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => addToMarkdown('1. yazi\n2. yazi')}
                  >
                    Sirali Liste Ekle
                  </Button>
 
                </div>

                <div className="flex flex-1">
                  <textarea
                    value={selectedArticle.postMd}
                    onChange={(e) =>
                      updateArticle(selectedArticle.id, e.target.value)
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

        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/x-png,image/jpeg"
          onChange={onFileUpload}
        />
      </div>
    </div>
  );
};

export default HomePage;
