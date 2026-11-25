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

export const tag = pgTable('tb_tag', {
  tag_id: varchar('tag_id', { length: 16 }).primaryKey(),
  board_id: varchar('board_id', { length: 16 }).notNull(),
  tag_name: varchar('tag_name', { length: 32 }),
  tag_type: varchar('tag_type', { length: 8 }),
});

/**
 * `tb_user`, without `password`. Only the columns in `authorJson`
 * (`repositories/user.repository.ts`) are safe to show to every member.
 */
export const user = pgTable('tb_user', {
  user_id: serial('user_id').primaryKey(),
  user_uuid: uuid('user_uuid'),
  /** The login id. */
  id: varchar('id', { length: 16 }).notNull(),
  username: varchar('username', { length: 16 }),
  aaa_no: varchar('aaa_no', { length: 16 }),
  nickname: varchar('nickname', { length: 16 }),
  col_no: varchar('col_no', { length: 8 }),
  major: varchar('major', { length: 32 }),
  email: varchar('email', { length: 64 }),
  mobile: varchar('mobile', { length: 16 }),
  introduction: text('introduction'),
  grade: integer('grade'),
  level: integer('level'),
  /** @deprecated Use `profile_url`. */
  profile_path: varchar('profile_path', { length: 256 }),
  profile_url: varchar('profile_url', { length: 256 }),
  login_at: timestamp('login_at', { withTimezone: true }),
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

export const exhibition = pgTable('tb_exhibition', {
  content_id: integer('content_id').primaryKey(),
  exhibition_no: integer('exhibition_no'),
  slogan: varchar('slogan', { length: 64 }),
  date_start: timestamp('date_start', { withTimezone: true }),
  date_end: timestamp('date_end', { withTimezone: true }),
  place: varchar('place', { length: 64 }),
  /** @deprecated Holds the same URL as `poster_url` for new posters. */
  poster_path: varchar('poster_path', { length: 256 }),
  /** @deprecated Holds the same URL as `poster_thumbnail_url` for new posters. */
  poster_thumbnail_path: varchar('poster_thumbnail_path', { length: 256 }),
  poster_url: varchar('poster_url', { length: 256 }),
  poster_thumbnail_url: varchar('poster_thumbnail_url', { length: 256 }),
});

/** `exhibition_id` is a legacy column; the exhibition is `parent_id`. */
export const exhibitPhoto = pgTable('tb_exhibit_photo', {
  content_id: integer('content_id').primaryKey(),
  exhibition_id: integer('exhibition_id'),
  order: integer('order'),
  photographer_id: integer('photographer_id'),
  photographer_alt: varchar('photographer_alt', { length: 32 }),
  /** @deprecated Holds the same URL as `img_url` for new photos. */
  file_path: varchar('file_path', { length: 256 }),
  /** @deprecated Holds the same URL as `thumbnail_url` for new photos. */
  thumbnail_path: varchar('thumbnail_path', { length: 256 }),
  location: varchar('location', { length: 256 }),
  camera: varchar('camera', { length: 256 }),
  lens: varchar('lens', { length: 256 }),
  exposure_time: varchar('exposure_time', { length: 256 }),
  focal_length: varchar('focal_length', { length: 32 }),
  f_stop: varchar('f_stop', { length: 8 }),
  iso: varchar('iso', { length: 8 }),
  date: timestamp('date', { withTimezone: true }),
  img_url: varchar('img_url', { length: 256 }),
  thumbnail_url: varchar('thumbnail_url', { length: 256 }),
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

export const equipmentCategory = pgTable('tb_equipment_category', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const equipment = pgTable('tb_equipment', {
  id: serial('id').primaryKey(),
  category_id: integer('category_id'),
  name: varchar('name', { length: 256 }),
  nickname: varchar('nickname', { length: 256 }),
  description: text('description'),
  location: varchar('location', { length: 64 }),
  maker: varchar('maker', { length: 64 }),
  /** `enums/equipmentStatusEnum.ts`. */
  status: varchar('status', { length: 16 }),
  /** `enums/equipmentRentEnum.ts`; kept in step with the status and rents. */
  rent_status: varchar('rent_status', { length: 16 }).default('RENTABLE'),
  img_path: varchar('img_path', { length: 256 }),
  ...timestamps,
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const rent = pgTable('tb_rent', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  equipment_id: integer('equipment_id').notNull(),
  start_date: timestamp('start_date', { withTimezone: true }).notNull(),
  end_date: timestamp('end_date', { withTimezone: true }),
  returned: boolean('returned').default(false),
});

export const rentReturn = pgTable('tb_rent_return', {
  rent_id: integer('rent_id').primaryKey(),
  photo_path: varchar('photo_path', { length: 256 }),
  return_date: timestamp('return_date', { withTimezone: true }),
  /** `enums/penaltyStatusEnum.ts`. */
  penalty_status: varchar('penalty_status', { length: 16 }),
});
