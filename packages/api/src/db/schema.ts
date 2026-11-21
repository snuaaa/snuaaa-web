import {
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
  file_path: varchar('file_path', { length: 256 }).array(),
});

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
