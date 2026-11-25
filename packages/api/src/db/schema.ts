import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/*
 * Drizzle table definitions for the tables `repositories/` use. They mirror
 * the SQL in `drizzle/` and don't drive it: migrations stay hand-written
 * (`pnpm db:generate --custom`), so when a migration changes one of these
 * tables, update the definition here too. Tables that only Sequelize uses
 * are added as their domain moves (#158).
 *
 * Soft deletes (`deleted_at`) are not applied automatically like Sequelize's
 * `paranoid`; repositories filter `deleted_at IS NULL` themselves.
 */

const timestamps = {
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull(),
};

export const board = pgTable('tb_board', {
  board_id: varchar('board_id', { length: 16 }).primaryKey(),
  board_name: varchar('board_name', { length: 32 }).notNull(),
  board_type: varchar('board_type', { length: 16 }),
  board_desc: text('board_desc'),
  menu: integer('menu'),
  order: integer('order'),
  lv_read: integer('lv_read'),
  lv_write: integer('lv_write'),
  lv_edit: integer('lv_edit'),
});

export const category = pgTable('tb_category', {
  category_id: varchar('category_id', { length: 16 }).primaryKey(),
  board_id: varchar('board_id', { length: 16 }).notNull(),
  category_name: varchar('category_name', { length: 32 }),
  category_color: varchar('category_color', { length: 8 }),
});

/** The columns of `tb_user` that are safe to show to other members. */
export const user = pgTable('tb_user', {
  user_id: serial('user_id').primaryKey(),
  user_uuid: uuid('user_uuid'),
  nickname: varchar('nickname', { length: 16 }),
  introduction: text('introduction'),
  grade: integer('grade'),
  level: integer('level'),
  /** @deprecated Use `profile_url`. */
  profile_path: varchar('profile_path', { length: 256 }),
  profile_url: varchar('profile_url', { length: 256 }),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const content = pgTable('tb_content', {
  content_id: serial('content_id').primaryKey(),
  content_uuid: uuid('content_uuid'),
  author_id: integer('author_id').notNull(),
  board_id: varchar('board_id', { length: 16 }),
  category_id: varchar('category_id', { length: 16 }),
  type: varchar('type', { length: 16 }),
  title: varchar('title', { length: 128 }),
  text: text('text'),
  view_num: integer('view_num').default(0),
  comment_num: integer('comment_num').default(0),
  like_num: integer('like_num').default(0),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  parent_id: integer('parent_id'),
});

export const post = pgTable('tb_post', {
  content_id: integer('content_id').primaryKey(),
});

export const document = pgTable('tb_document', {
  content_id: integer('content_id').primaryKey(),
  generation: integer('generation'),
});

export const attachedFile = pgTable('tb_file', {
  file_id: serial('file_id').primaryKey(),
  parent_id: integer('parent_id').notNull(),
  original_name: varchar('original_name', { length: 256 }),
  /** @deprecated Old local paths; newer files only have `file_url`. */
  file_path: varchar('file_path', { length: 256 }),
  file_url: varchar('file_url', { length: 256 }),
  file_type: varchar('file_type', { length: 16 }),
  download_count: integer('download_count').default(0),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const album = pgTable('tb_album', {
  content_id: integer('content_id').primaryKey(),
  is_private: boolean('is_private'),
  /** The cover photo's content id. */
  tn_photo_id: integer('tn_photo_id'),
});

/** `album_id` is left out: it is a legacy column, the album is `parent_id`. */
export const photo = pgTable('tb_photo', {
  content_id: integer('content_id').primaryKey(),
  /** @deprecated Old local paths; newer photos only have `img_url`. */
  file_path: varchar('file_path', { length: 256 }),
  /** @deprecated Old local paths; newer photos only have `thumbnail_url`. */
  thumbnail_path: varchar('thumbnail_path', { length: 256 }),
  img_url: varchar('img_url', { length: 256 }).notNull(),
  thumbnail_url: varchar('thumbnail_url', { length: 256 }).notNull(),
  location: varchar('location', { length: 256 }),
  camera: varchar('camera', { length: 256 }),
  lens: varchar('lens', { length: 256 }),
  exposure_time: varchar('exposure_time', { length: 256 }),
  focal_length: varchar('focal_length', { length: 64 }),
  f_stop: varchar('f_stop', { length: 64 }),
  iso: varchar('iso', { length: 64 }),
  date: timestamp('date', { withTimezone: true }),
});

export const contentTag = pgTable(
  'tb_content_tag',
  {
    content_id: integer('content_id').notNull(),
    tag_id: varchar('tag_id', { length: 16 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.content_id, t.tag_id] })],
);

export const comment = pgTable('tb_comment', {
  comment_id: serial('comment_id').primaryKey(),
  comment_uuid: uuid('comment_uuid'),
  parent_id: integer('parent_id').notNull(),
  author_id: integer('author_id').notNull(),
  text: text('text'),
  like_num: integer('like_num').default(0),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  parent_comment_id: integer('parent_comment_id'),
});

export const contentLike = pgTable(
  'tb_content_like',
  {
    content_id: integer('content_id').notNull(),
    user_id: integer('user_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.content_id, t.user_id] })],
);

export const commentLike = pgTable(
  'tb_comment_like',
  {
    comment_id: integer('comment_id').notNull(),
    user_id: integer('user_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.comment_id, t.user_id] })],
);
