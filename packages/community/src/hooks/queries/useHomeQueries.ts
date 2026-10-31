import { queryOptions, useQuery } from '@tanstack/react-query';
import HomeService from '~/services/HomeService';

// Query keys
export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
  allPosts: (page: number) => [...homeKeys.all, 'allPosts', page] as const,
  riseSet: () => [...homeKeys.all, 'riseSet'] as const,
};

// Query options
export const homeDataQueryOptions = () =>
  queryOptions({
    queryKey: homeKeys.data(),
    queryFn: async () => {
      const [soundBoxData, recentPosts, recentMemory, recentAstroPhoto] =
        await Promise.all([
          HomeService.retrieveSoundBox(),
          HomeService.retrieveRecentPosts(),
          HomeService.retrieveRecentMemory(),
          HomeService.retrieveRecentAstroPhoto(),
        ]);

      return { soundBoxData, recentPosts, recentMemory, recentAstroPhoto };
    },
  });

export const allPostsQueryOptions = (pageIdx: number) =>
  queryOptions({
    queryKey: homeKeys.allPosts(pageIdx),
    queryFn: () => HomeService.retrieveAllPosts(pageIdx),
  });

export const riseSetQueryOptions = () =>
  queryOptions({
    queryKey: homeKeys.riseSet(),
    queryFn: () => HomeService.retrieveRiseSet(),
    staleTime: 60 * 60 * 1000,
  });

// Hooks
export function useHomeData() {
  return useQuery(homeDataQueryOptions());
}

export function useAllPosts(pageIdx: number) {
  return useQuery(allPostsQueryOptions(pageIdx));
}

export function useRiseSet({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...riseSetQueryOptions(), enabled });
}
