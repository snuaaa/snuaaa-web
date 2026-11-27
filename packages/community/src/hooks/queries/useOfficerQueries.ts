import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import OfficerService from '~/services/OfficerService';
import { sessionQueryOptions } from '~/hooks/queries/useAuthQueries';
import type { OfficerInput } from '~/services/types';

export const officerKeys = {
  all: ['officers'] as const,
  list: () => [...officerKeys.all, 'list'] as const,
};

export function useOfficers() {
  return useQuery({
    queryKey: officerKeys.list(),
    queryFn: () => OfficerService.retrieveOfficers(),
    select: (data) => data.generations,
  });
}

export function useSaveOfficers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      generation,
      ...input
    }: OfficerInput & { generation: number }) =>
      OfficerService.saveOfficers(generation, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerKeys.all });
    },
  });
}

export function useDeleteOfficers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (generation: number) =>
      OfficerService.deleteOfficers(generation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerKeys.all });
    },
  });
}

/** 회기 넘기기. Grades change, so the session is checked again too. */
export function useHandOver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presidentUuid: string) =>
      OfficerService.handOver(presidentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerKeys.all });
      queryClient.invalidateQueries({
        queryKey: sessionQueryOptions().queryKey,
      });
    },
  });
}
