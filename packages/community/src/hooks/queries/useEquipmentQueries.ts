import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import EquipmentService, {
  CreateEquipmentRequest,
  RentEquipmentRequest,
  UpdateEquipmentRequest,
} from '~/services/EquipmentService';
import { PenaltyStatus } from '~/services/types';

export type AllRentRecordFilters = {
  penaltyStatus?: PenaltyStatus | '';
  dateFromStart?: string;
  dateToStart?: string;
  dateFromReturn?: string;
  dateToReturn?: string;
};

// Query keys
export const equipmentKeys = {
  all: ['equipment'] as const,
  list: () => [...equipmentKeys.all, 'list'] as const,
  myRentList: () => [...equipmentKeys.all, 'myRentList'] as const,
  rentRecord: (id: number, page: number) =>
    [...equipmentKeys.all, 'rentRecord', id, page] as const,
  categories: () => [...equipmentKeys.all, 'categories'] as const,
  allRentRecords: (filters: AllRentRecordFilters, page: number) =>
    [...equipmentKeys.all, 'allRentRecords', filters, page] as const,
};

// Query options
export const equipmentListQueryOptions = () =>
  queryOptions({
    queryKey: equipmentKeys.list(),
    queryFn: () => EquipmentService.retrieveList(),
  });

export const myRentListQueryOptions = () =>
  queryOptions({
    queryKey: equipmentKeys.myRentList(),
    queryFn: () => EquipmentService.retrieveMyRentList(),
  });

export const rentRecordQueryOptions = (equipmentId: number, page: number) =>
  queryOptions({
    queryKey: equipmentKeys.rentRecord(equipmentId, page),
    queryFn: () => EquipmentService.retrieveRentRecord(equipmentId, page),
  });

export const equipmentCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: equipmentKeys.categories(),
    queryFn: () => EquipmentService.retrieveCategoryList(),
  });

// Hooks
export function useEquipmentList() {
  return useQuery(equipmentListQueryOptions());
}

export function useMyRentList() {
  return useQuery(myRentListQueryOptions());
}

export function useRentRecord(equipmentId: number, page: number) {
  return useQuery(rentRecordQueryOptions(equipmentId, page));
}

export function useEquipmentCategories(enabled = true) {
  return useQuery({
    ...equipmentCategoriesQueryOptions(),
    enabled,
  });
}

export function useRentEquipments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RentEquipmentRequest) =>
      EquipmentService.rentEquipments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.myRentList() });
    },
  });
}

export function useReturnEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rentId,
      photo_path,
    }: {
      rentId: number;
      photo_path: string;
    }) => EquipmentService.returnEquipment(rentId, photo_path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.myRentList() });
    },
  });
}

// All rent records (for late fee management)
export const allRentRecordsQueryOptions = (
  filters: AllRentRecordFilters,
  page: number,
) =>
  queryOptions({
    queryKey: equipmentKeys.allRentRecords(filters, page),
    queryFn: () =>
      EquipmentService.retrieveAllRentRecords({
        penaltyStatus: filters.penaltyStatus || undefined,
        dateFromStart: filters.dateFromStart || undefined,
        dateToStart: filters.dateToStart || undefined,
        dateFromReturn: filters.dateFromReturn || undefined,
        dateToReturn: filters.dateToReturn || undefined,
        page,
      }),
  });

export function useAllRentRecords(
  filters: AllRentRecordFilters,
  page: number,
) {
  return useQuery(allRentRecordsQueryOptions(filters, page));
}

export function useUpdatePenaltyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rentId,
      penaltyStatus,
    }: {
      rentId: number;
      penaltyStatus: PenaltyStatus;
    }) => EquipmentService.updatePenaltyStatus(rentId, penaltyStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...equipmentKeys.all, 'allRentRecords'],
      });
    },
  });
}

// Equipment CRUD mutations
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipmentRequest) =>
      EquipmentService.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list() });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEquipmentRequest) =>
      EquipmentService.updateEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list() });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => EquipmentService.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list() });
    },
  });
}

// Category CRUD mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => EquipmentService.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      EquipmentService.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => EquipmentService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() });
    },
  });
}
