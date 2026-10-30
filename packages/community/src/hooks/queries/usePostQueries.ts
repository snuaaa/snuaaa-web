import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import PostService, { CreatePostRequest } from '~/services/PostService';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  list: (params?: {
    board_id?: string;
    user_uuid?: string;
    search_type?: string;
    search_keyword?: string;
    offset?: number;
    limit?: number;
  }) => [...postKeys.all, 'list', ...(params ? [params] : [])] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

// Hook for fetching post list
export function usePostList(params: {
  board_id?: string;
  user_uuid?: string;
  search_type?: string;
  search_keyword?: string;
  offset?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => PostService.retrievePostList(params),
    // Keep the current page on screen while the next page of the same list
    // loads, but not when the board or the search changes.
    placeholderData: (previousData, previousQuery) => {
      const prev = previousQuery?.queryKey[2] as typeof params | undefined;
      const sameList =
        prev?.board_id === params.board_id &&
        prev?.user_uuid === params.user_uuid &&
        prev?.search_type === params.search_type &&
        prev?.search_keyword === params.search_keyword;
      return sameList ? keepPreviousData(previousData) : undefined;
    },
  });
}

// Hook for fetching a single post
export function usePost(postId: number) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => PostService.retrievePost(postId),
    enabled: !!postId,
  });
}

// Hook for creating a post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      board_id,
      data,
    }: {
      board_id: string;
      data: CreatePostRequest;
    }) => PostService.createPost(board_id, data),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// Hook for updating a post
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      post_id,
      data,
    }: {
      post_id: number;
      data: CreatePostRequest;
    }) => PostService.updatePost(post_id, data),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// Hook for deleting a post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post_id: number) => PostService.deletePost(post_id),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
