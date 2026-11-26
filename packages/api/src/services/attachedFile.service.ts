import path from 'path';
import { NotFoundError } from '../errors';
import * as files from '../repositories/attachedFile.repository';
import * as contents from '../repositories/content.repository';
import { parseId } from '../repositories/utils';
import { uploadFileToS3 } from '../utils/upload';
import { assertCanEdit } from './permissions';
import type { Actor } from './types';

const contentNotFound = () => new NotFoundError('Content not found');
const fileNotFound = () => new NotFoundError('FILE NOT FOUND');

/** The type the web shows for a file, from its extension in any case. */
const FILE_TYPES: Record<string, string> = {
  jpg: 'IMG',
  jpeg: 'IMG',
  png: 'IMG',
  doc: 'DOC',
  docx: 'DOC',
  xls: 'XLS',
  xlsx: 'XLS',
  ppt: 'PPT',
  pptx: 'PPT',
  pdf: 'PDF',
  hwp: 'HWP',
  zip: 'ZIP',
};

function fileTypeOf(name: string) {
  return FILE_TYPES[path.extname(name).slice(1).toLowerCase()] ?? 'N';
}

/**
 * Attaches a file to the content, which the actor must be allowed to edit
 * (404 for an unknown content, 403 otherwise). It is uploaded to S3 only
 * after that check.
 */
export async function attachFile(
  actor: Actor,
  contentId: string,
  file: { buffer: Buffer; name: string; mimeType?: string },
) {
  const target = await contents.findWithBoard(contentId);
  if (!target) {
    throw contentNotFound();
  }
  assertCanEdit(actor, target);
  const fileUrl = await uploadFileToS3(
    file.buffer,
    file.name,
    'attached-file',
    file.mimeType,
  );
  await files.insert({
    parent_id: target.content_id,
    original_name: file.name,
    file_url: fileUrl,
    file_type: fileTypeOf(file.name),
  });
}

/**
 * Soft-deletes the file. The actor must be allowed to edit its content
 * (404 for an unknown file, 403 otherwise).
 */
export async function deleteFile(actor: Actor, fileId: string) {
  const id = parseId(fileId);
  const parentId = id === null ? null : await files.findParentId(id);
  if (id === null || parentId === null) {
    throw fileNotFound();
  }
  const target = await contents.findWithBoard(parentId);
  if (!target) {
    throw fileNotFound();
  }
  assertCanEdit(actor, target);
  if ((await files.softDelete(id)) === 0) {
    throw fileNotFound();
  }
}

/**
 * Where to download the file attached to the content from, counting the
 * download: its S3 URL, or the old local path of a file that has none. 404
 * for an unknown file or one attached to another content. Anyone may
 * download, as the web links to it without a token.
 */
export async function downloadFile(contentId: string, fileId: string) {
  const contentNumber = parseId(contentId);
  const fileNumber = parseId(fileId);
  if (contentNumber === null || fileNumber === null) {
    throw fileNotFound();
  }
  const file = await files.findInContent(fileNumber, contentNumber);
  if (!file?.location) {
    throw fileNotFound();
  }
  await files.addDownload(fileNumber);
  return { location: file.location, originalName: file.original_name };
}
