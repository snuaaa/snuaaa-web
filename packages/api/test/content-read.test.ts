import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createAttachedFile,
  createBoard,
  createCategory,
  createContent,
  createContentLike,
  createDocument,
  createPost,
  createUser,
  type Board,
  type User,
} from './helpers/factories';
import { contentState, softDeleteUser } from './helpers/db';

/*
 * The JSON the web reads from the post and document read endpoints, kept
 * exactly as the Sequelize version answered it (camelCase timestamps, the
 * attached files' `file_path` falling back from `file_url`, ...).
 */

const CREATED = new Date('2024-03-01T10:00:00.000Z');
const UPDATED = new Date('2024-03-02T10:00:00.000Z');

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  const { category_id } = await createCategory(board);
  return { board, author, categoryId: category_id };
}

async function get(path: string, user: User) {
  return api().get(path).set('Authorization', bearer(user));
}

function fileJson(
  fileId: number,
  contentId: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    file_id: fileId,
    parent_id: contentId,
    original_name: expect.any(String),
    file_path: expect.any(String),
    file_url: expect.any(String),
    file_type: 'application/pdf',
    download_count: 0,
    createdAt: CREATED.toISOString(),
    updatedAt: CREATED.toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

function contentJson(
  contentId: number,
  author: User,
  board: Board,
  overrides: Record<string, unknown> = {},
) {
  return {
    content_id: contentId,
    content_uuid: expect.any(String),
    author_id: author.user_id,
    board_id: board.board_id,
    category_id: null,
    type: 'PO',
    parent_id: null,
    title: expect.any(String),
    text: expect.any(String),
    view_num: 0,
    comment_num: 0,
    like_num: 0,
    createdAt: CREATED.toISOString(),
    updatedAt: UPDATED.toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

function detailUserJson(user: User) {
  return {
    user_id: user.user_id,
    user_uuid: user.user_uuid,
    nickname: user.nickname,
    introduction: null,
    grade: user.grade,
    level: user.level,
    profile_path: null,
    profile_url: null,
    deleted_at: null,
  };
}

describe('GET /api/document/:doc_id', () => {
  it('returns the document with its author, board and files', async () => {
    const { board, author, categoryId } = await setup();
    const documentId = await createDocument(author, board, {
      category_id: categoryId,
      title: 'minutes',
      text: 'notes',
      generation: 33,
      view_num: 4,
      created_at: CREATED,
      updated_at: UPDATED,
    });
    const s3File = await createAttachedFile(documentId, {
      created_at: CREATED,
      file_url: 'https://bucket.example.com/a.pdf',
    });
    const localFile = await createAttachedFile(documentId, {
      created_at: CREATED,
      file_url: null,
      file_path: '/upload/b.pdf',
    });
    await createAttachedFile(documentId, { deleted_at: new Date() });
    await createContentLike(author, documentId);

    const response = await get(`/api/document/${documentId}`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      docuInfo: {
        ...contentJson(documentId, author, board, {
          type: 'DO',
          category_id: categoryId,
          title: 'minutes',
          text: 'notes',
          view_num: 4,
        }),
        document: { content_id: documentId, generation: 33 },
        user: detailUserJson(author),
        board: {
          board_id: board.board_id,
          board_name: expect.any(String),
          lv_read: 10,
        },
        attachedFiles: [
          fileJson(s3File, documentId, {
            file_url: 'https://bucket.example.com/a.pdf',
            file_path: 'https://bucket.example.com/a.pdf',
          }),
          fileJson(localFile, documentId, {
            file_url: null,
            file_path: '/upload/b.pdf',
          }),
        ],
      },
      likeInfo: true,
    });
    // The view counts after the response is read, without touching
    // `updated_at` (the web shows "edited" when it differs from createdAt).
    const state = await contentState(documentId);
    expect(state.view_num).toBe(5);
    expect(state.updated_at).toEqual(UPDATED);
  });

  it("shows a deleted author's documents, and likeInfo false when not liked", async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board);
    await softDeleteUser(author);
    const reader = await createUser({ grade: 8 });

    const response = await get(`/api/document/${documentId}`, reader);

    expect(response.status).toBe(200);
    expect(response.body.likeInfo).toBe(false);
    expect(response.body.docuInfo.user).toMatchObject({
      user_id: author.user_id,
      deleted_at: expect.any(String),
    });
    expect(response.body.docuInfo.attachedFiles).toEqual([]);
  });

  it('returns 404 for a post, a deleted document, an unknown or non-numeric id', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);
    const deletedId = await createDocument(author, board, {
      deleted_at: new Date(),
    });

    for (const id of [postId, deletedId, 999999, 'abc']) {
      const response = await get(`/api/document/${id}`, author);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'Document not found',
      });
    }
    expect((await contentState(postId)).view_num).toBe(0);
  });

  it("returns 403 above the board's read level, without counting a view", async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const documentId = await createDocument(staff, board);
    const member = await createUser({ grade: 8 });

    const response = await get(`/api/document/${documentId}`, member);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ success: false, error: 'FORBIDDEN' });
    expect((await contentState(documentId)).view_num).toBe(0);
  });
});

describe('GET /api/document', () => {
  it('lists documents with their author, category and files', async () => {
    const { board, author, categoryId } = await setup();
    const documentId = await createDocument(author, board, {
      category_id: categoryId,
      title: 'minutes',
      text: 'notes',
      generation: 33,
    });
    const fileId = await createAttachedFile(documentId, {
      created_at: CREATED,
    });

    const response = await get('/api/document', author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      docCount: 1,
      docInfo: [
        {
          content_id: documentId,
          generation: 33,
          content: {
            content_id: documentId,
            title: 'minutes',
            text: 'notes',
            user: { nickname: author.nickname, deleted_at: null },
            category: { category_name: expect.any(String) },
            attachedFiles: [fileJson(fileId, documentId)],
          },
        },
      ],
    });
  });

  it('orders by last update and pages by 10, leaving out deleted and uncategorized documents', async () => {
    const { board, author, categoryId } = await setup();
    const ids: number[] = [];
    for (let day = 1; day <= 12; day++) {
      ids.push(
        await createDocument(author, board, {
          category_id: categoryId,
          updated_at: new Date(Date.UTC(2024, 0, day)),
        }),
      );
    }
    await createDocument(author, board, {
      category_id: categoryId,
      deleted_at: new Date(),
    });
    await createDocument(author, board);
    const newestFirst = [...ids].reverse();

    const first = await get('/api/document', author);
    const second = await get('/api/document?page=2', author);

    expect(first.body.docCount).toBe(12);
    expect(first.body.docInfo.map((d) => d.content_id)).toEqual(
      newestFirst.slice(0, 10),
    );
    expect(second.body.docCount).toBe(12);
    expect(second.body.docInfo.map((d) => d.content_id)).toEqual(
      newestFirst.slice(10),
    );
  });

  it('filters by category and generation, ignoring empty values', async () => {
    const { board, author, categoryId } = await setup();
    const other = await createCategory(board);
    const match = await createDocument(author, board, {
      category_id: categoryId,
      generation: 33,
    });
    await createDocument(author, board, {
      category_id: other.category_id,
      generation: 33,
    });
    await createDocument(author, board, {
      category_id: categoryId,
      generation: 34,
    });

    const filtered = await get(
      `/api/document?category=${categoryId}&generation=33`,
      author,
    );
    expect(filtered.body.docCount).toBe(1);
    expect(filtered.body.docInfo.map((d) => d.content_id)).toEqual([match]);

    const empty = await get('/api/document?category=&generation=', author);
    expect(empty.body.docCount).toBe(3);
  });

  it("leaves out documents on boards above the reader's grade", async () => {
    const { board, author, categoryId } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    const staffCategory = await createCategory(staffBoard);
    const open = await createDocument(author, board, {
      category_id: categoryId,
    });
    const staff = await createUser({ grade: 6 });
    const hidden = await createDocument(staff, staffBoard, {
      category_id: staffCategory.category_id,
    });

    const member = await get('/api/document', author);
    expect(member.body.docCount).toBe(1);
    expect(member.body.docInfo.map((d) => d.content_id)).toEqual([open]);

    const staffView = await get('/api/document', staff);
    expect(staffView.body.docCount).toBe(2);
    expect(staffView.body.docInfo.map((d) => d.content_id).sort()).toEqual(
      [open, hidden].sort(),
    );
  });

  it('returns 400 for a generation that is not a number', async () => {
    const { author } = await setup();

    const response = await get('/api/document?generation=abc', author);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: 'BAD_REQUEST',
    });
  });
});

describe('GET /api/post/:post_id', () => {
  it('returns the post with its author, board and files', async () => {
    const { board, author, categoryId } = await setup();
    const postId = await createPost(author, board, {
      category_id: categoryId,
      title: 'hello',
      text: 'world',
      comment_num: 2,
      like_num: 1,
      created_at: CREATED,
      updated_at: UPDATED,
    });
    const fileId = await createAttachedFile(postId, { created_at: CREATED });
    await createAttachedFile(postId, { deleted_at: new Date() });
    const reader = await createUser({ grade: 9 });

    const response = await get(`/api/post/${postId}`, reader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      postInfo: {
        ...contentJson(postId, author, board, {
          category_id: categoryId,
          title: 'hello',
          text: 'world',
          comment_num: 2,
          like_num: 1,
        }),
        post: { content_id: postId },
        user: detailUserJson(author),
        board: {
          board_id: board.board_id,
          board_name: expect.any(String),
          lv_read: 10,
        },
        attachedFiles: [fileJson(fileId, postId)],
      },
      likeInfo: false,
    });
    const state = await contentState(postId);
    expect(state.view_num).toBe(1);
    expect(state.updated_at).toEqual(UPDATED);
  });

  it('returns 404 for a document, a deleted post, an unknown or non-numeric id', async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board);
    const deletedId = await createPost(author, board, {
      deleted_at: new Date(),
    });

    for (const id of [documentId, deletedId, 999999, 'abc']) {
      const response = await get(`/api/post/${id}`, author);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'Post not found',
      });
    }
  });
});

describe('GET /api/post/list', () => {
  it('lists posts with their author and board', async () => {
    const { board, author, categoryId } = await setup();
    const postId = await createPost(author, board, {
      category_id: categoryId,
      title: 'hello',
      text: 'world',
      view_num: 3,
      created_at: CREATED,
      updated_at: UPDATED,
    });
    // A PO content without its `tb_post` row is still listed, with null.
    const bare = await createContent(author, board, {
      created_at: new Date('2024-02-01T00:00:00.000Z'),
      updated_at: UPDATED,
    });

    const response = await get(
      `/api/post/list?board_id=${board.board_id}`,
      author,
    );

    expect(response.status).toBe(200);
    const listUser = {
      nickname: author.nickname,
      profile_path: null,
      profile_url: null,
    };
    const listBoard = {
      board_id: board.board_id,
      board_name: expect.any(String),
    };
    expect(response.body).toEqual({
      count: 2,
      rows: [
        {
          ...contentJson(postId, author, board, {
            category_id: categoryId,
            title: 'hello',
            text: 'world',
            view_num: 3,
          }),
          post: { content_id: postId },
          user: listUser,
          board: listBoard,
        },
        {
          ...contentJson(bare, author, board, {
            createdAt: '2024-02-01T00:00:00.000Z',
          }),
          post: null,
          user: listUser,
          board: listBoard,
        },
      ],
    });
  });

  it('lists only readable boards, newest first, with limit and offset', async () => {
    const { board, author } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    const otherBoard = await createBoard({ lv_read: 10 });
    const ids: number[] = [];
    for (let day = 1; day <= 4; day++) {
      ids.push(
        await createPost(author, day % 2 ? board : otherBoard, {
          created_at: new Date(Date.UTC(2024, 0, day)),
        }),
      );
    }
    await createPost(author, staffBoard);
    await createPost(author, board, { deleted_at: new Date() });
    await createDocument(author, board);
    const newestFirst = [...ids].reverse();

    const all = await get('/api/post/list', author);
    expect(all.body.count).toBe(4);
    expect(all.body.rows.map((p) => p.content_id)).toEqual(newestFirst);

    const page = await get('/api/post/list?limit=2&offset=1', author);
    expect(page.body.count).toBe(4);
    expect(page.body.rows.map((p) => p.content_id)).toEqual(
      newestFirst.slice(1, 3),
    );

    const ignored = await get('/api/post/list?limit=&offset=abc', author);
    expect(ignored.body.rows).toHaveLength(4);
  });

  it("filters by the author's user_uuid, including a deleted author's posts", async () => {
    const { board, author } = await setup();
    const other = await createUser({ grade: 8 });
    const mine = await createPost(author, board);
    await createPost(other, board);

    const response = await get(
      `/api/post/list?user_uuid=${author.user_uuid}`,
      author,
    );
    expect(response.body.count).toBe(1);
    expect(response.body.rows[0].content_id).toBe(mine);

    await softDeleteUser(other);
    const all = await get('/api/post/list', author);
    expect(all.body.count).toBe(2);
  });

  it('returns 404 for an unknown or deleted user_uuid', async () => {
    const { author } = await setup();
    const left = await createUser({ grade: 8 });
    await softDeleteUser(left);

    for (const uuid of [
      '00000000-0000-0000-0000-000000000000',
      left.user_uuid,
    ]) {
      const response = await get(`/api/post/list?user_uuid=${uuid}`, author);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
      });
    }
  });

  it('searches the title, the text, both, or the nickname', async () => {
    const { board, author } = await setup();
    const writer = await createUser({ grade: 8, nickname: 'stargazer' });
    const inTitle = await createPost(author, board, {
      title: 'Orion tonight',
      text: 'clear sky',
      created_at: new Date(Date.UTC(2024, 0, 3)),
    });
    const inText = await createPost(author, board, {
      title: 'observation',
      text: 'saw Orion',
      created_at: new Date(Date.UTC(2024, 0, 2)),
    });
    const byWriter = await createPost(writer, board, {
      title: 'moon',
      text: 'full',
      created_at: new Date(Date.UTC(2024, 0, 1)),
    });

    const search = async (type: string, keyword: string) => {
      const response = await get(
        `/api/post/list?search_type=${type}&search_keyword=${encodeURIComponent(keyword)}`,
        author,
      );
      expect(response.status).toBe(200);
      return response.body.rows.map((p) => p.content_id);
    };

    expect(await search('title', 'Orion')).toEqual([inTitle]);
    expect(await search('text', 'Orion')).toEqual([inText]);
    expect(await search('all', 'Orion')).toEqual([inTitle, inText]);
    expect(await search('user', 'gazer')).toEqual([byWriter]);
    // LIKE is case-sensitive.
    expect(await search('title', 'orion')).toEqual([]);
    // A blank keyword or an unknown type lists everything.
    expect(await search('title', '  ')).toEqual([inTitle, inText, byWriter]);
    expect(await search('other', 'Orion')).toEqual([inTitle, inText, byWriter]);
  });
});
