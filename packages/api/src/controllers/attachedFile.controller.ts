import { AttachedFileModel } from '../models';

export async function createAttachedFile(content_id, data) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  await AttachedFileModel.create({
    parent_id: content_id,
    original_name: data.original_name,
    file_path: data.file_path,
    file_type: data.file_type,
  });
}

export async function retrieveAttachedFile(file_id) {
  if (!file_id) {
    throw new Error('id can not be null');
  }

  return AttachedFileModel.findOne({
    attributes: ['file_id', 'original_name', 'file_path', 'file_type'],
    where: { file_id: file_id },
  });
}

export async function retrieveAttachedFilesInContent(content_id) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  return AttachedFileModel.findAll({
    attributes: ['file_id', 'original_name', 'file_type', 'download_count'],
    where: { parent_id: content_id },
    order: [['file_id', 'ASC']],
  });
}

export async function increaseDownloadCount(file_id) {
  if (!file_id) {
    throw new Error('file_id can not be null');
  }

  await AttachedFileModel.increment('download_count', {
    where: { file_id: file_id },
    silent: true,
  });
}

export async function deleteAttachedFile(file_id) {
  if (!file_id) {
    throw new Error('file_id can not be null');
  }

  await AttachedFileModel.destroy({
    where: {
      file_id: file_id,
    },
  });
}
