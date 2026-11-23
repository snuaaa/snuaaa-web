import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import OfficerService from '~/services/OfficerService';
import type { OfficerRole } from '~/services/types';

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
      roles,
    }: {
      generation: number;
      roles: OfficerRole[];
    }) => OfficerService.saveOfficers(generation, roles),
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
