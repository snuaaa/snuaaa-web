import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import AlbumService, {
  UpdateAlbumThumbnailRequest,
} from '~/services/AlbumService';
import PhotoBoardService, {
  CreateAlbumRequest,
} from '~/services/PhotoBoardService';
import { Content } from '~/services/types';
import { photoKeys } from './usePhotoQueries';

// Query keys
export const albumKeys = {
  all: ['albums'] as const,
  detail: (id: number) => [...albumKeys.all, 'detail', id] as const,
  inBoard: (boardId: string, page: number, category?: string) =>
    [...albumKeys.all, 'inBoard', boardId, page, category] as const,
};

// Query options
export const albumQueryOptions = (albumId: number) =>
  queryOptions({
    queryKey: albumKeys.detail(albumId),
    queryFn: async () => {
      const [albumData, photos] = await Promise.all([
        AlbumService.retrieveAlbum(albumId),
        AlbumService.retrievePhotosInAlbum(albumId),
      ]);
      return { albumData, photos };
    },
  });

export const albumsInBoardQueryOptions = (
  boardId: string,
  page: number,
  category?: string,
) =>
  queryOptions({
    queryKey: albumKeys.inBoard(boardId, page, category),
    queryFn: () =>
      PhotoBoardService.retrieveAlbumsInPhotoBoard(boardId, page, category),
  });

// Hooks
export function useAlbum(albumId: number) {
  return useQuery(albumQueryOptions(albumId));
}

export function useAlbumsInPhotoBoard(
  boardId: string,
  page: number,
  category?: string,
) {
  return useQuery(albumsInBoardQueryOptions(boardId, page, category));
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (album_id: number) => AlbumService.deleteAlbum(album_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ album_id, data }: { album_id: number; data: Content }) =>
      AlbumService.updateAlbum(album_id, data),
    onSuccess: (_, { album_id }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(album_id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      board_id,
      data,
    }: {
      board_id: string;
      data: CreateAlbumRequest;
    }) => PhotoBoardService.createAlbum(board_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}

export function useUpdateAlbumThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      album_id,
      data,
    }: {
      album_id: number;
      data: UpdateAlbumThumbnailRequest;
    }) => AlbumService.updateAlbumThumbnail(album_id, data),
    onSuccess: (_, { album_id }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(album_id) });
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
    },
  });
}
