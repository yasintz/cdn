import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  gSheetStorage,
  gSheetStorageDeprecated,
} from '@/utils/zustand/gsheet-storage';
import shadown from 'showdown';
import { entryTemplate } from './pages/entry-template';

const converter = new shadown.Converter();

export enum ArticleTypeEnum {
  Idare = 'idare',
  Ceza = 'ceza',
  Icra = 'icra',
}

export type ArticleType = {
  id: string;
  title: string;
  post: string;
  postMd?: string;
  type: ArticleTypeEnum;
};

type StoreType = {
  articles: ArticleType[];
  addArticle: (article: ArticleType) => void;
  updateTitle: (id: string, title: string) => void;
  updateArticle: (
    id: string,
    values: { postMd?: string; type?: ArticleTypeEnum }
  ) => void;
  deleteArticle: (id: string) => void;
};

export const useStore = create(
  persist<StoreType>(
    (set) => ({
      articles: [],
      addArticle: (a) => set((prev) => ({ articles: [...prev.articles, a] })),
      deleteArticle: (id) =>
        set((prev) => ({ articles: prev.articles.filter((a) => a.id !== id) })),
      updateTitle: (id, title) => {
        set((prev) => ({
          articles: prev.articles.map((a) =>
            a.id === id
              ? {
                  ...a,
                  title,
                }
              : a
          ),
        }));
      },
      updateArticle: (id, { postMd, type }) => {
        set((prev) => {
          const newArticles = prev.articles.map((a) =>
            a.id === id
              ? {
                  ...a,
                  postMd: typeof postMd === 'string' ? postMd : a.postMd,
                  post: postMd ? converter.makeHtml(postMd) : a.post,
                  type: type || a.type,
                }
              : a
          );
          const defaultPost = entryTemplate(
            newArticles.filter((i) => i.id !== 'default')
          );

          return {
            articles: newArticles.map((i) =>
              i.id === 'default'
                ? {
                    ...i,
                    post: defaultPost,
                  }
                : i
            ),
          };
        });
      },
    }),
    {
      name: 'akyuz-kukuk',
    }
  )
);
gSheetStorage(
  '1t2-j9ax78gCnhv3Y0s0W0IIfcIPyOd-DHB5PimUmXbQ',
  '1557948135'
).handleStore(useStore, true);
