import { Button } from '@/components/ui/button';
import { ArticleType, useStore } from '../store';
import _ from 'lodash';
import FileUpload from './FileUpload';

type HeaderProps = {
  article: ArticleType;
};

const Header = ({ article }: HeaderProps) => {
  const { updateArticle } = useStore();

  const addToMarkdown = (str: string) => {
    updateArticle(article.id, {
      postMd: `${article.postMd || ''}\n${str}`,
    });
  };
  const onFileUpload = (url: string) => addToMarkdown(`![image.png](${url})`);

  return (
    <div className="flex my-2 gap-2">
      <FileUpload onUpload={onFileUpload} />
      <Button variant="secondary" onClick={() => addToMarkdown('# Baslik')}>
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
  );
};

export default Header;
