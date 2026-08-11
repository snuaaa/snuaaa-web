import { AttachedFileModel } from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import { uploadFileToS3 } from '../utils/upload';

export async function createAttachedFile(content_id, data) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  await AttachedFileModel.create({
    parent_id: content_id,
    original_name: data.original_name,
    file_path: data.file_path,
    file_url: data.file_url,
    file_type: data.file_type,
  });
}

export async function retrieveAttachedFile(file_id) {
  if (!file_id) {
    throw new Error('id can not be null');
  }

  return AttachedFileModel.findOne({
    attributes: ['file_id', 'original_name', 'file_path', 'file_url', 'file_type'],
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

export async function migrateAttachedFiles() {
  const files = await AttachedFileModel.findAll({
    where: {
      file_path: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.like]: 'upload/file/%' }],
      },
      file_url: {
        [Op.is]: null,
      },
    },
    limit: 10,
    order: [['file_id', 'ASC']],
  });

  await Promise.all(
    files.map(async (file) => {
      const file_id = file.getDataValue('file_id');
      const filePath = file.getDataValue('file_path');
      const originalName = file.getDataValue('original_name');

      let buffer: Buffer;
      try {
        buffer = await fs.promises.readFile(filePath);
      } catch (err) {
        console.error(`Local attached file not found: ${filePath}`, err);
        await AttachedFileModel.update(
          { file_url: '' },
          { where: { file_id: file_id } },
        );
        return;
      }

      const fileUrl = await uploadFileToS3(buffer, originalName);

      await AttachedFileModel.update(
        { file_url: fileUrl, file_path: fileUrl },
        { where: { file_id: file_id } },
      );

      // await fs.promises.unlink(filePath).catch((err) => {
      //   console.error(`Failed to delete local attached file: ${filePath}`, err);
      // });
    }),
  );
}
