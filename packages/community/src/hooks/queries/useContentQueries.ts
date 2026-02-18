import { useMutation } from '@tanstack/react-query';
import ContentService from '~/services/ContentService';
import FileService from '~/services/FileService';

export function useLikeContent() {
  return useMutation({
    mutationFn: (content_id: number) => ContentService.likeContent(content_id),
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

export function useDeleteFile() {
  return useMutation({
    mutationFn: (file_id: number) => FileService.deleteFile(file_id),
  });
}
