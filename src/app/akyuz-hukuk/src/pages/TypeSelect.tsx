import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArticleType, ArticleTypeEnum, useStore } from '../store';

type TypeSelectProps = {
  article: ArticleType;
};

const TypeSelect = ({ article }: TypeSelectProps) => {
  const { updateArticle } = useStore();
  return (
    <Select
      defaultValue={article.type || ArticleTypeEnum.Ceza}
      onValueChange={(value) =>
        updateArticle(article.id, {
          type: value as ArticleTypeEnum,
        })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ArticleTypeEnum.Ceza}>Ceza</SelectItem>
          <SelectItem value={ArticleTypeEnum.Icra}>Icra</SelectItem>
          <SelectItem value={ArticleTypeEnum.Idare}>Idare</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TypeSelect;
