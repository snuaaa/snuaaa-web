import {
  AlbumModel,
  BoardModel,
  ContentModel,
  PhotoModel,
  TagModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import { uploadImageToS3 } from '../utils/upload';
import { resizeImageBuffer } from '../utils/resize';
import path from 'path';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { SearchType } from './post.controller';

const getSearchCondition = (type?: SearchType, keyword?: string) => {
  if (!type || !keyword || keyword.trim() === '') {
    return {};
  }
  switch (type) {
    case 'all': {
      return {
        content: {
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${keyword}%`,
              },
            },
            {
              text: {
                [Op.like]: `%${keyword}%`,
              },
            },
          ],
        },
      };
    }
    case 'title': {
      return {
        content: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'text': {
      return {
        content: {
          text: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'user': {
      return {
        user: {
          nickname: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    default:
      return {};
  }
};

export type PhotoResponse = ContentModel & {
  photo: PhotoModel;
  parent: ContentModel & { album: AlbumModel };
  user: UserModel;
  board: BoardModel;
  tags: TagModel[];
};

export async function retrievePhoto(
  photo_id: string | number,
): Promise<PhotoResponse> {
  if (!photo_id) {
    throw new Error('id can not be null');
  }

  const photo = await ContentModel.findOne({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: ContentModel,
        as: 'parent',
        include: [
          {
            model: AlbumModel,
            as: 'album',
            // require: true,
          },
        ],
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'grade',
          'level',
          'email',
          'profile_path',
          'deleted_at',
        ],
        paranoid: false,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name', 'lv_read'],
      },
      {
        model: TagModel,
        // through: ContentTagModel,
        as: 'tags',
      },
    ],
    where: { content_id: photo_id },
    order: [
      ['tags', 'tag_type', 'ASC'],
      ['tags', 'tag_id', 'ASC'],
    ],
  });

  if (!photo) {
    throw new Error('Photo not found');
  }

  return photo as PhotoResponse;
}

export type PhotoFilter = {
  board_id?: string;
  author_id?: string;
  read_grade: number;
  limit?: number;
  offset?: number;
  search_keyword?: string;
  search_type?: SearchType;
  tags?: string[];
};

export function retrievePhotosWithFilter(filter: PhotoFilter) {
  const {
    board_id,
    author_id,
    read_grade,
    limit = 20,
    offset = 0,
    search_keyword,
    search_type,
    tags,
  } = filter;
  const { content, user } = getSearchCondition(search_type, search_keyword);
  return ContentModel.findAndCountAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname'],
        paranoid: false, // 삭제된 유저의 글도 보이도록
        where: user,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
        where: {
          lv_read: {
            [Op.gte]: read_grade,
          },
        },
      },
      {
        model: TagModel,
        as: 'tags',
        ...(tags && {
          where: {
            tag_id: tags,
          },
        }),
      },
    ],
    distinct: true,
    where: {
      type: ContentTypeEnum.PHOTO,
      ...content,
      ...(board_id && { board_id }),
      ...(author_id && { author_id }),
    },
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset,
  });
}

export async function retrievePrevPhoto(photo_id, album_id) {
  if (!photo_id) {
    throw new Error('photo_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: {
      content_id: {
        [Op.lt]: photo_id,
      },
      parent_id: album_id,
    },
    order: [['content_id', 'DESC']],
  });
}

export async function retrieveNextPhoto(photo_id, album_id) {
  if (!photo_id) {
    throw new Error('photo_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: {
      content_id: {
        [Op.gt]: photo_id,
      },
      parent_id: album_id,
    },
    order: [['content_id', 'ASC']],
  });
}

export async function retrievePrevAlbumPhoto(album_id, board_id) {
  if (!board_id) {
    throw new Error('board_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: {
      parent_id: {
        [Op.lt]: album_id,
      },
      board_id: board_id,
    },
    order: [
      ['parent_id', 'DESC'],
      ['content_id', 'DESC'],
    ],
  });
}

export async function retrieveNextAlbumPhoto(album_id, board_id) {
  if (!board_id) {
    throw new Error('board_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: {
      parent_id: {
        [Op.gt]: album_id,
      },
      board_id: board_id,
    },
    order: [
      ['parent_id', 'ASC'],
      ['content_id', 'DESC'],
    ],
  });
}

export async function retrievePhotosInAlbum(album_id) {
  if (!album_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'deleted_at'],
        paranoid: false,
      },
    ],
    where: { parent_id: album_id },
    order: [
      ['created_at', 'DESC'],
      ['content_id', 'DESC'],
    ],
  });
}

export async function retrievePhotoCountInBoard(board_id) {
  if (!board_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.count({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: { board_id: board_id },
  });
}

export async function retrievePhotosInBoard(board_id, rowNum, offset) {
  if (!board_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'deleted_at'],
        paranoid: false,
      },
    ],
    where: { board_id: board_id },
    order: [
      ['created_at', 'DESC'],
      ['content_id', 'DESC'],
    ],
    limit: rowNum,
    offset: offset,
  });
}

export async function retrievePhotoCountByTag(tags) {
  if (!tags) {
    throw new Error('tag can not be null');
  }

  return ContentModel.count({
    distinct: true,
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: TagModel,
        as: 'tags',
        where: {
          tag_id: tags,
        },
      },
    ],
  });
}

export async function retrievePhotosByTag(tags, rowNum, offset) {
  if (!tags) {
    throw new Error('tag can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: TagModel,
        // through: ContentTagModel,
        as: 'tags',
        where: {
          tag_id: tags,
        },
      },
    ],
    order: [
      ['created_at', 'DESC'],
      ['content_id', 'DESC'],
    ],
    limit: rowNum,
    offset: offset,
  });
}

/**
 * @deprecated
 */
export async function retrievePhotosByUser(user_id) {
  if (!user_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
    ],
    where: {
      author_id: user_id,
    },
    order: [['updated_at', 'DESC']],
    limit: 16,
  });
}

/**
 * @deprecated
 */
export async function retrievePhotosByUserUuid(user_uuid) {
  if (!user_uuid) {
    throw new Error('user_uuid can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'profile_path',
        ],
        where: {
          user_uuid: user_uuid,
        },
      },
    ],
    order: [['updated_at', 'DESC']],
    limit: 16,
  });
}

export async function createPhoto(data) {
  const content = await ContentModel.create(
    {
      content_uuid: data.content_uuid,
      author_id: data.author_id,
      board_id: data.board_id,
      category_id: data.category_id,
      title: data.title,
      text: data.text,
      type: 'PH',
      parent_id: data.album_id,
      photo: {
        file_path: data.file_path,
        thumbnail_path: data.thumbnail_path,
        img_url: data.img_url,
        thumbnail_url: data.thumbnail_url,
        location: data.location,
        camera: data.camera,
        lens: data.lens,
        exposure_time: data.exposure_time,
        focal_length: data.focal_length,
        f_stop: data.f_stop,
        iso: data.iso,
        date: data.date,
      },
    },
    {
      include: [
        {
          model: PhotoModel,
          as: 'photo',
        },
      ],
    },
  );

  return content.getDataValue('content_id');
}

export async function updatePhoto(photo_id, data) {
  if (!photo_id) {
    throw new Error('id can not be null');
  }

  await PhotoModel.update(
    {
      file_path: data.file_path,
      thumbnail_path: data.thumbnail_path,
      location: data.location,
      camera: data.camera,
      lens: data.lens,
      exposure_time: data.exposure_time,
      focal_length: data.focal_length,
      f_stop: data.f_stop,
      iso: data.iso,
      date: data.date,
    },
    {
      where: {
        content_id: photo_id,
      },
    },
  );
}

export async function deletePhoto(photo_id) {
  if (!photo_id) {
    throw new Error('id can not be null');
  }

  await PhotoModel.destroy({
    where: {
      content_id: photo_id,
    },
  });
}

// find 50 photos having file_path is not null and upload to s3 and update img_url and thumbnail_url
export async function migratePhotos() {
  const photoModels = await PhotoModel.findAll({
    where: {
      file_path: {
        [Op.ne]: null,
      },
      img_url: {
        [Op.is]: null,
      },
    },
    limit: 10,
    order: [['content_id', 'ASC']],
  });

  await Promise.all(
    photoModels.map(async (photo) => {
      // upload to s3 and get new url
      const filePath = path.join(
        '.',
        'upload',
        photo.getDataValue('file_path'),
      );
      const buffer = await fs.promises.readFile(filePath);
      const thumbnailBuffer = await resizeImageBuffer(buffer, {
        shortSideSize: 360,
      });
      const [imgUrl, thumbnailUrl] = await Promise.all([
        uploadImageToS3(buffer),
        uploadImageToS3(thumbnailBuffer),
      ]);
      await PhotoModel.update(
        {
          img_url: imgUrl,
          thumbnail_url: thumbnailUrl,
        },
        {
          where: {
            content_id: photo.getDataValue('content_id'),
          },
          silent: true,
        },
      );
    }),
  );
}
