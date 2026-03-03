import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import CommentService from '~/services/CommentService';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  list: (params?: { user_uuid?: string; offset?: number; limit?: number }) =>
    [...commentKeys.all, 'list', ...(params ? [params] : [])] as const,
  byParent: (parentId: number) =>
    [...commentKeys.all, 'byParent', parentId] as const,
};

// Query options
export const commentsQueryOptions = (parentId: number) =>
  queryOptions({
    queryKey: commentKeys.byParent(parentId),
    queryFn: () => CommentService.retrieveComments(parentId),
  });

export const commentListQueryOptions = (params: {
  user_uuid?: string;
  offset?: number;
  limit?: number;
}) =>
  queryOptions({
    queryKey: commentKeys.list(params),
    queryFn: () => CommentService.retrieveCommentList(params),
  });

// Hooks
export function useComments(parentId: number) {
  return useQuery(commentsQueryOptions(parentId));
}

export function useCommentList(params: {
  user_uuid?: string;
  offset?: number;
  limit?: number;
}) {
  return useQuery(commentListQueryOptions(params));
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      data,
    }: {
      parentId: number;
      data: { text: string };
    }) => CommentService.createComment(parentId, data),
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byParent(parentId),
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: number;
      data: { text: string };
    }) => CommentService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => CommentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => CommentService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
