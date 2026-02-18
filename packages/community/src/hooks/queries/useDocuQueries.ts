import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import DocuService, {
  CreateDocuRequest,
  RetrieveDocumentParams,
} from '~/services/DocuService';
import ContentService from '~/services/ContentService';
import FileService from '~/services/FileService';

// Query keys
export const docuKeys = {
  all: ['documents'] as const,
  list: (params?: RetrieveDocumentParams) =>
    [...docuKeys.all, 'list', ...(params ? [params] : [])] as const,
  detail: (id: number) => [...docuKeys.all, 'detail', id] as const,
};

// Query options
export const documentQueryOptions = (docId: number) =>
  queryOptions({
    queryKey: docuKeys.detail(docId),
    queryFn: () => DocuService.retrieveDocument(docId),
  });

export const documentsQueryOptions = (params: RetrieveDocumentParams) =>
  queryOptions({
    queryKey: docuKeys.list(params),
    queryFn: () => DocuService.retrieveDocuments(params),
  });

// Hooks
export function useDocument(docId: number) {
  return useQuery(documentQueryOptions(docId));
}

export function useDocuments(params: RetrieveDocumentParams) {
  return useQuery(documentsQueryOptions(params));
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      board_id,
      data,
    }: {
      board_id: string;
      data: CreateDocuRequest;
    }) => DocuService.createDocument(board_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docuKeys.list() });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doc_id,
      data,
    }: {
      doc_id: number;
      data: Parameters<typeof DocuService.updateDocument>[1];
    }) => DocuService.updateDocument(doc_id, data),
    onSuccess: (_, { doc_id }) => {
      queryClient.invalidateQueries({ queryKey: docuKeys.detail(doc_id) });
      queryClient.invalidateQueries({ queryKey: docuKeys.list() });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doc_id: number) => DocuService.deleteDocument(doc_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docuKeys.list() });
    },
  });
}

export function useLikeContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content_id: number) => ContentService.likeContent(content_id),
    onSuccess: (_, content_id) => {
      queryClient.invalidateQueries({
        queryKey: docuKeys.detail(content_id),
      });
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (file_id: number) => FileService.deleteFile(file_id),
  });
}

export function useCreateFile() {
  return useMutation({
    mutationFn: ({
      content_id,
      formData,
      onUploadProgress,
    }: {
      content_id: number;
      formData: FormData;
      onUploadProgress: Parameters<typeof ContentService.createFile>[2];
    }) => ContentService.createFile(content_id, formData, onUploadProgress),
  });
}
