// Drizzle schema used only by drizzle-kit to generate migrations (`pnpm db:generate`).
// Keep it in sync with the Sequelize models in src/models until the ORM migration (#158).
// Baseline introspected with `drizzle-kit pull`; see docs/db-migration.md.
import {
  pgTable,
  foreignKey,
  serial,
  uuid,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';

export const tbComment = pgTable(
  'tb_comment',
  {
    commentId: serial('comment_id').primaryKey().notNull(),
    commentUuid: uuid('comment_uuid'),
    parentId: integer('parent_id').notNull(),
    parentCommentId: integer('parent_comment_id'),
    authorId: integer('author_id').notNull(),
    text: text(),
    likeNum: integer('like_num').default(0),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_comment_parent_id_fkey',
    }).onUpdate('cascade'),
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.commentId],
      name: 'tb_comment_parent_comment_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [tbUser.userId],
      name: 'tb_comment_author_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbBoard = pgTable('tb_board', {
  boardId: varchar('board_id', { length: 16 }).primaryKey().notNull(),
  boardName: varchar('board_name', { length: 32 }).notNull(),
  boardType: varchar('board_type', { length: 16 }),
  boardDesc: text('board_desc'),
  menu: integer(),
  order: integer(),
  lvRead: integer('lv_read'),
  lvWrite: integer('lv_write'),
  lvEdit: integer('lv_edit'),
});

export const tbCategory = pgTable(
  'tb_category',
  {
    categoryId: varchar('category_id', { length: 16 }).primaryKey().notNull(),
    boardId: varchar('board_id', { length: 16 }).notNull(),
    categoryName: varchar('category_name', { length: 32 }),
    categoryColor: varchar('category_color', { length: 8 }),
  },
  (table) => [
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [tbBoard.boardId],
      name: 'tb_category_board_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbUser = pgTable('tb_user', {
  userId: serial('user_id').primaryKey().notNull(),
  userUuid: uuid('user_uuid'),
  id: varchar({ length: 16 }).notNull(),
  password: varchar({ length: 64 }),
  username: varchar({ length: 16 }),
  aaaNo: varchar('aaa_no', { length: 16 }),
  nickname: varchar({ length: 16 }),
  colNo: varchar('col_no', { length: 8 }),
  major: varchar({ length: 32 }),
  email: varchar({ length: 64 }),
  mobile: varchar({ length: 16 }),
  introduction: text(),
  profilePath: varchar('profile_path', { length: 256 }),
  profileUrl: varchar('profile_url', { length: 256 }),
  grade: integer(),
  level: integer(),
  loginAt: timestamp('login_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
});

export const tbContent = pgTable(
  'tb_content',
  {
    contentId: serial('content_id').primaryKey().notNull(),
    contentUuid: uuid('content_uuid'),
    authorId: integer('author_id').notNull(),
    boardId: varchar('board_id', { length: 16 }),
    categoryId: varchar('category_id', { length: 16 }),
    type: varchar({ length: 16 }),
    parentId: integer('parent_id'),
    title: varchar({ length: 64 }),
    text: text(),
    viewNum: integer('view_num').default(0),
    commentNum: integer('comment_num').default(0),
    likeNum: integer('like_num').default(0),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [tbUser.userId],
      name: 'tb_content_author_id_fkey',
    }).onUpdate('cascade'),
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [tbBoard.boardId],
      name: 'tb_content_board_id_fkey',
    }).onUpdate('cascade'),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [tbCategory.categoryId],
      name: 'tb_content_category_id_fkey',
    }).onUpdate('cascade'),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.contentId],
      name: 'tb_content_parent_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbAlbum = pgTable(
  'tb_album',
  {
    contentId: integer('content_id').primaryKey().notNull(),
    isPrivate: boolean('is_private'),
    tnPhotoId: integer('tn_photo_id'),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_album_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.tnPhotoId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_album_tn_photo_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbFile = pgTable(
  'tb_file',
  {
    fileId: serial('file_id').primaryKey().notNull(),
    parentId: integer('parent_id').notNull(),
    originalName: varchar('original_name', { length: 256 }),
    filePath: varchar('file_path', { length: 256 }),
    fileUrl: varchar('file_url', { length: 256 }),
    fileType: varchar('file_type', { length: 16 }),
    downloadCount: integer('download_count').default(0),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_file_parent_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbTag = pgTable(
  'tb_tag',
  {
    tagId: varchar('tag_id', { length: 16 }).primaryKey().notNull(),
    boardId: varchar('board_id', { length: 16 }).notNull(),
    tagName: varchar('tag_name', { length: 32 }),
    tagType: varchar('tag_type', { length: 8 }),
  },
  (table) => [
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [tbBoard.boardId],
      name: 'tb_tag_board_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const tbDocument = pgTable(
  'tb_document',
  {
    contentId: integer('content_id').primaryKey().notNull(),
    generation: integer(),
    filePath: varchar('file_path', { length: 256 }).array(),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_document_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const tbExhibition = pgTable(
  'tb_exhibition',
  {
    contentId: integer('content_id').primaryKey().notNull(),
    exhibitionNo: integer('exhibition_no'),
    slogan: varchar({ length: 64 }),
    dateStart: timestamp('date_start', { withTimezone: true, mode: 'string' }),
    dateEnd: timestamp('date_end', { withTimezone: true, mode: 'string' }),
    place: varchar({ length: 64 }),
    posterPath: varchar('poster_path', { length: 256 }),
    posterThumbnailPath: varchar('poster_thumbnail_path', { length: 256 }),
    posterUrl: varchar('poster_url', { length: 256 }),
    posterThumbnailUrl: varchar('poster_thumbnail_url', { length: 256 }),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_exhibition_content_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbExhibitPhoto = pgTable(
  'tb_exhibit_photo',
  {
    contentId: integer('content_id').primaryKey().notNull(),
    order: integer(),
    photographerId: integer('photographer_id'),
    photographerAlt: varchar('photographer_alt', { length: 32 }),
    filePath: varchar('file_path', { length: 256 }),
    thumbnailPath: varchar('thumbnail_path', { length: 256 }),
    imgUrl: varchar('img_url', { length: 256 }),
    thumbnailUrl: varchar('thumbnail_url', { length: 256 }),
    location: varchar({ length: 256 }),
    camera: varchar({ length: 256 }),
    lens: varchar({ length: 256 }),
    exposureTime: varchar('exposure_time', { length: 256 }),
    focalLength: varchar('focal_length', { length: 32 }),
    fStop: varchar('f_stop', { length: 8 }),
    iso: varchar({ length: 8 }),
    date: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_exhibit_photo_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.photographerId],
      foreignColumns: [tbUser.userId],
      name: 'tb_exhibit_photo_photographer_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbPhoto = pgTable(
  'tb_photo',
  {
    contentId: integer('content_id').primaryKey().notNull(),
    filePath: varchar('file_path', { length: 256 }),
    thumbnailPath: varchar('thumbnail_path', { length: 256 }),
    imgUrl: varchar('img_url', { length: 256 }),
    thumbnailUrl: varchar('thumbnail_url', { length: 256 }),
    location: varchar({ length: 256 }),
    camera: varchar({ length: 256 }),
    lens: varchar({ length: 256 }),
    exposureTime: varchar('exposure_time', { length: 256 }),
    focalLength: varchar('focal_length', { length: 32 }),
    fStop: varchar('f_stop', { length: 8 }),
    iso: varchar({ length: 8 }),
    date: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_photo_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const tbPost = pgTable(
  'tb_post',
  {
    contentId: integer('content_id').primaryKey().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_post_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const tbEquipmentCategory = pgTable('tb_equipment_category', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 256 }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
});

export const tbEquipment = pgTable(
  'tb_equipment',
  {
    id: serial().primaryKey().notNull(),
    categoryId: integer('category_id'),
    name: varchar({ length: 256 }),
    nickname: varchar({ length: 256 }),
    description: text(),
    location: varchar({ length: 64 }),
    maker: varchar({ length: 64 }),
    status: varchar({ length: 16 }),
    rentStatus: varchar('rent_status', { length: 16 }).default('RENTABLE'),
    imgPath: varchar('img_path', { length: 256 }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [tbEquipmentCategory.id],
      name: 'tb_equipment_category_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbRent = pgTable(
  'tb_rent',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    equipmentId: integer('equipment_id').notNull(),
    startDate: timestamp('start_date', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true, mode: 'string' }),
    returned: boolean().default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUser.userId],
      name: 'tb_rent_user_id_fkey',
    }).onUpdate('cascade'),
    foreignKey({
      columns: [table.equipmentId],
      foreignColumns: [tbEquipment.id],
      name: 'tb_rent_equipment_id_fkey',
    }).onUpdate('cascade'),
  ],
);

export const tbRentReturn = pgTable(
  'tb_rent_return',
  {
    rentId: integer('rent_id').primaryKey().notNull(),
    photoPath: varchar('photo_path', { length: 256 }),
    returnDate: timestamp('return_date', {
      withTimezone: true,
      mode: 'string',
    }),
    penaltyStatus: varchar('penalty_status', { length: 16 }),
  },
  (table) => [
    foreignKey({
      columns: [table.rentId],
      foreignColumns: [tbRent.id],
      name: 'tb_rent_return_rent_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const tbCommentLike = pgTable(
  'tb_comment_like',
  {
    commentId: integer('comment_id').notNull(),
    userId: integer('user_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.commentId],
      foreignColumns: [tbComment.commentId],
      name: 'tb_comment_like_comment_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbComment.commentId],
      name: 'tb_comment_like_user_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    primaryKey({
      columns: [table.commentId, table.userId],
      name: 'tb_comment_like_pkey',
    }),
    unique('tb_comment_like_comment_id_key').on(table.commentId),
    unique('tb_comment_like_user_id_key').on(table.userId),
  ],
);

export const tbContentTag = pgTable(
  'tb_content_tag',
  {
    contentId: integer('content_id').notNull(),
    tagId: varchar('tag_id', { length: 16 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_content_tag_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tbTag.tagId],
      name: 'tb_content_tag_tag_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    primaryKey({
      columns: [table.contentId, table.tagId],
      name: 'tb_content_tag_pkey',
    }),
  ],
);

export const tbContentLike = pgTable(
  'tb_content_like',
  {
    contentId: integer('content_id').notNull(),
    userId: integer('user_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [tbContent.contentId],
      name: 'tb_content_like_content_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUser.userId],
      name: 'tb_content_like_user_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    primaryKey({
      columns: [table.contentId, table.userId],
      name: 'tb_content_like_pkey',
    }),
  ],
);

export const tbStatsLogin = pgTable(
  'tb_stats_login',
  {
    userId: integer('user_id').notNull(),
    loginAt: timestamp('login_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUser.userId],
      name: 'tb_stats_login_user_id_fkey',
    }).onUpdate('cascade'),
    primaryKey({
      columns: [table.userId, table.loginAt],
      name: 'tb_stats_login_pkey',
    }),
  ],
);
