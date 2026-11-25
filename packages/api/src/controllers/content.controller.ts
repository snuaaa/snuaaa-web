import { ContentModel } from '../models';
import { BadRequestError } from '../errors';

export async function increaseViewNum(content_id) {
  if (!content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentModel.increment('view_num', {
    where: { content_id: content_id },
    silent: true,
  });
}
