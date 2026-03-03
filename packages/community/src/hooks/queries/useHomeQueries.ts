import { queryOptions, useQuery } from '@tanstack/react-query';
import HomeService from '~/services/HomeService';
import ExhibitionService from '~/services/ExhibitionService';

// Query keys
export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
  allPosts: (page: number) => [...homeKeys.all, 'allPosts', page] as const,
  allComments: (page: number) =>
    [...homeKeys.all, 'allComments', page] as const,
};

// Query options
export const homeDataQueryOptions = () =>
  queryOptions({
    queryKey: homeKeys.data(),
    queryFn: async () => {
      const res = await Promise.all([
        HomeService.retrieveSoundBox(),
        HomeService.retrieveRecentPosts(),
        HomeService.retrieveRecentComments(),
        HomeService.retrieveRecentMemory(),
        HomeService.retrieveRecentAstroPhoto(),
        ExhibitionService.retrieveExhibitionsInBoard('brd'),
      ]);

      return {
        soundBoxData: res[0],
        recentPosts: res[1],
        recentComments: res[2],
        recentMemory: res[3],
        recentAstroPhoto: res[4],
        recentExhibitions: res[5],
      };
    },
  });

export const allPostsQueryOptions = (pageIdx: number) =>
  queryOptions({
    queryKey: homeKeys.allPosts(pageIdx),
    queryFn: () => HomeService.retrieveAllPosts(pageIdx),
  });

export const allCommentsQueryOptions = (pageIdx: number) =>
  queryOptions({
    queryKey: homeKeys.allComments(pageIdx),
    queryFn: () => HomeService.retrieveAllComments(pageIdx),
  });

// Hooks
export function useHomeData() {
  return useQuery(homeDataQueryOptions());
}

export function useAllPosts(pageIdx: number) {
  return useQuery(allPostsQueryOptions(pageIdx));
}

export function useAllComments(pageIdx: number) {
  return useQuery(allCommentsQueryOptions(pageIdx));
}
