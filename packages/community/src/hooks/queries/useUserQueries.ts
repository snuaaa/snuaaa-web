import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import UserService, {
  FindIdRequest,
  FindPasswordRequest,
  UpdatePasswordRequest,
  UpdateUserInfoRequest,
} from '~/services/UserService';
import { UsersSearchType } from '~/types/SearchTypes';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  detail: (uuid: string) => [...userKeys.all, 'detail', uuid] as const,
  me: () => [...userKeys.all, 'me'] as const,
  list: (params?: UsersSearchType) =>
    [...userKeys.all, 'list', ...(params ? [params] : [])] as const,
  searchMini: (name: string) => [...userKeys.all, 'searchMini', name] as const,
};

// Query options
export const userInfoQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: userKeys.detail(userUuid),
    queryFn: () => UserService.retrieveUserInfo(userUuid),
  });

// Hooks
export function useUserInfo(userUuid: string) {
  return useQuery(userInfoQueryOptions(userUuid));
}

export function useMyUserInfo() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => UserService.retrieveUserInfo(),
  });
}

export function useUserList(params: UsersSearchType) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => UserService.retrieveUsers(params),
  });
}

// Mutations
export function useUpdateUserInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInfoRequest) =>
      UserService.updateUserInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUserInfo() {
  return useMutation({
    mutationFn: () => UserService.deleteUserInfo(),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      UserService.updatePassword(data),
  });
}

export function useFindId() {
  return useMutation({
    mutationFn: (data: FindIdRequest) => UserService.findId(data),
  });
}

export function useFindPassword() {
  return useMutation({
    mutationFn: (data: FindPasswordRequest) => UserService.findPassword(data),
  });
}

export function useSearchMini() {
  return useMutation({
    mutationFn: (name: string) => UserService.searchMini(name),
  });
}
