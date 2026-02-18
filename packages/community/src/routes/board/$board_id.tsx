import { createFileRoute } from '@tanstack/react-router';
import Board from '../../pages/Board';

export type BoardSearch = {
  status?: string;
  page?: number;
  type?: string;
  keyword?: string;
  category?: string;
  generation?: string; // input value usually string
  tags?: string[];
  view?: 'photo' | 'album';
};

export const Route = createFileRoute('/board/$board_id')({
  validateSearch: (search: Record<string, unknown>): BoardSearch => {
    return {
      status: (search.status as string) || undefined,
      page: Number(search.page) || 1,
      type: (search.type as string) || undefined,
      keyword: (search.keyword as string) || undefined,
      category: (search.category as string) || undefined,
      generation: (search.generation as string) || undefined,
      tags: Array.isArray(search.tags)
        ? (search.tags as string[])
        : typeof search.tags === 'string'
          ? [search.tags]
          : undefined,
      view: (search.view as 'photo' | 'album') || undefined,
    };
  },
  component: Board,
});
