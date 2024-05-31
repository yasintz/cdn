import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import shadown from 'showdown';

const converter = new shadown.Converter();

type ArticleType = {
  id: string;
  title: string;
  post: string;
  postMd?: string;
};

type StoreType = {
  articles: ArticleType[];
  addArticle: (article: ArticleType) => void;
  updateTitle: (id: string, title: string) => void;
  updateArticle: (id: string, postMd: string) => void;
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
      updateArticle: (id, postMd) => {
        set((prev) => ({
          articles: prev.articles.map((a) =>
            a.id === id
              ? {
                  ...a,
                  postMd,
                  post: converter.makeHtml(postMd),
                }
              : a
          ),
        }));
      },
    }),
    {
      name: 'akyuz-kukuk',
      storage: createJSONStorage(() => gSheetStorage('1557948135')),
    }
  )
);
