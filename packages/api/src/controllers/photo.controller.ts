import {
  AlbumModel,
  BoardModel,
  ContentModel,
  ContentTagModel,
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

export function retrievePhoto(photo_id) {
  return new Promise((resolve, reject) => {
    if (!photo_id) {
      reject('id can not be null');
    }

    ContentModel.findOne({
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
    })
      .then((photoInfo) => {
        resolve(photoInfo);
      })
      .catch((err) => {
        reject(err);
      });
  });
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

export function retrievePrevPhoto(photo_id, album_id) {
  return new Promise((resolve, reject) => {
    if (!photo_id) {
      reject('photo_id can not be null');
    } else {
      ContentModel.findOne({
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
      })
        .then((photo) => {
          resolve(photo);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrieveNextPhoto(photo_id, album_id) {
  return new Promise((resolve, reject) => {
    if (!photo_id) {
      reject('photo_id can not be null');
    } else {
      ContentModel.findOne({
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
      })
        .then((photo) => {
          resolve(photo);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePrevAlbumPhoto(album_id, board_id) {
  return new Promise((resolve, reject) => {
    if (!board_id) {
      reject('board_id can not be null');
    } else {
      ContentModel.findOne({
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
      })
        .then((photo) => {
          resolve(photo);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrieveNextAlbumPhoto(album_id, board_id) {
  return new Promise((resolve, reject) => {
    if (!board_id) {
      reject('board_id can not be null');
    } else {
      ContentModel.findOne({
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
      })
        .then((photo) => {
          resolve(photo);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePhotosInAlbum(album_id) {
  return new Promise((resolve, reject) => {
    if (!album_id) {
      reject('id can not be null');
    } else {
      ContentModel.findAll({
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
      })
        .then((photos) => {
          resolve(photos);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePhotoCountInBoard(board_id) {
  return new Promise((resolve, reject) => {
    if (!board_id) {
      reject('id can not be null');
    } else {
      ContentModel.count({
        include: [
          {
            model: PhotoModel,
            as: 'photo',
            required: true,
          },
        ],
        where: { board_id: board_id },
      })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePhotosInBoard(board_id, rowNum, offset) {
  return new Promise((resolve, reject) => {
    if (!board_id) {
      reject('id can not be null');
    } else {
      ContentModel.findAll({
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
      })
        .then((photos) => {
          resolve(photos);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePhotoCountByTag(tags) {
  return new Promise((resolve, reject) => {
    if (!tags) {
      reject('tag can not be null');
    } else {
      ContentModel.count({
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
      })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function retrievePhotosByTag(tags, rowNum, offset) {
  return new Promise((resolve, reject) => {
    if (!tags) {
      reject('tag can not be null');
    } else {
      ContentModel.findAll({
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
      })
        .then((photos) => {
          resolve(photos);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

/**
 * @deprecated
 */
export function retrievePhotosByUser(user_id) {
  return new Promise((resolve, reject) => {
    if (!user_id) {
      reject('id can not be null');
    } else {
      ContentModel.findAll({
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
      })
        .then((photos) => {
          resolve(photos);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

/**
 * @deprecated
 */
export function retrievePhotosByUserUuid(user_uuid) {
  return new Promise((resolve, reject) => {
    if (!user_uuid) {
      reject('user_uuid can not be null');
    } else {
      ContentModel.findAll({
        include: [
          {
            model: PhotoModel,
            as: 'photo',
            required: true,
          },
          {
            model: UserModel,
            required: true,
            attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'profile_path'],
            where: {
              user_uuid: user_uuid,
            },
          },
        ],
        order: [['updated_at', 'DESC']],
        limit: 16,
      })
        .then((photos) => {
          resolve(photos);
        })
        .catch((err) => {
          reject(err);
        });
    }
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

export function updatePhoto(photo_id, data) {
  return new Promise<void>((resolve, reject) => {
    if (!photo_id) {
      reject('id can not be null');
    } else {
      PhotoModel.update(
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
      )
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

export function deletePhoto(photo_id) {
  return new Promise<void>((resolve, reject) => {
    if (!photo_id) {
      reject('id can not be null');
    } else {
      PhotoModel.destroy({
        where: {
          content_id: photo_id,
        },
      })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    }
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
    photoModels.map((photo) => {
      return new Promise<void>((resolve, reject) => {
        // upload to s3 and get new url
        const filePath = path.join('.', 'upload', photo.getDataValue('file_path'));
        fs.readFile(filePath, async (err, buffer) => {
          if (err) {
            reject(err);
            return;
          }
          const thumbnailBuffer = await resizeImageBuffer(buffer, { shortSideSize: 360 });
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
          resolve();
        });
      });
    }),
  );
}
