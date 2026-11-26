import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createComment,
  createCommentLike,
  createPost,
  createUser,
  type User,
} from './helpers/factories';
import { softDeleteUser } from './helpers/db';

/*
 * The comment reads the web makes: a content's comment threads
 * (`CommentSection`) and a member's comments on the profile page
 * (`comment/list` with `user_uuid`, `limit` and `offset`).
 */

const DAY = 24 * 60 * 60 * 1000;
const BASE = new Date('2024-03-01T10:00:00.000Z').getTime();
const day = (n: number) => new Date(BASE + n * DAY);

function as(user: User) {
  return { Authorization: bearer(user) };
}

function userJson(user: User, overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

function commentJson(
  commentId: number,
  contentId: number,
  author: User,
  overrides: Record<string, unknown> = {},
) {
  return {
    comment_id: commentId,
    comment_uuid: expect.any(String),
    parent_id: contentId,
    parent_comment_id: null,
    author_id: author.user_id,
    text: expect.any(String),
    like_num: 0,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    deletedAt: null,
    ...overrides,
  };
}

async function setup() {
  const board = await createBoard({ lv_read: 9 });
  const author = await createUser({ grade: 8 });
  const postId = await createPost(author, board);
  return { board, author, postId };
}

describe('GET /api/content/:content_id/comments', () => {
  it('returns the threads oldest first, each with its author, likers and replies', async () => {
    const { author, postId } = await setup();
    const replier = await createUser({ grade: 8 });
    const later = await createComment(author, postId, { created_at: day(2) });
    const first = await createComment(author, postId, {
      created_at: day(0),
      text: 'First',
    });
    const secondReply = await createComment(replier, postId, {
      parent_comment_id: first,
      created_at: day(1),
    });
    const firstReply = await createComment(replier, postId, {
      parent_comment_id: first,
      created_at: day(0.5),
    });
    await createComment(replier, postId, { deleted_at: day(0) });
    await createComment(replier, postId, {
      parent_comment_id: first,
      deleted_at: day(0),
    });
    await createCommentLike(replier, first);
    await createCommentLike(author, firstReply);
    await softDeleteUser(replier);

    const response = await api()
      .get(`/api/content/${postId}/comments`)
      .set(as(await createUser()));

    expect(response.status).toBe(200);
    const deletedReplier = userJson(replier, {
      deleted_at: expect.any(String),
    });
    expect(response.body).toEqual([
      {
        ...commentJson(first, postId, author, { text: 'First' }),
        user: userJson(author),
        likeUsers: [
          {
            ...deletedReplier,
            commentLike: { comment_id: first, user_id: replier.user_id },
          },
        ],
        children: [
          {
            ...commentJson(firstReply, postId, replier, {
              parent_comment_id: first,
            }),
            user: deletedReplier,
            likeUsers: [
              {
                ...userJson(author),
                commentLike: {
                  comment_id: firstReply,
                  user_id: author.user_id,
                },
              },
            ],
          },
          {
            ...commentJson(secondReply, postId, replier, {
              parent_comment_id: first,
            }),
            user: deletedReplier,
            likeUsers: [],
          },
        ],
      },
      {
        ...commentJson(later, postId, author),
        user: userJson(author),
        likeUsers: [],
        children: [],
      },
    ]);
  });
});

describe('GET /api/comment/list', () => {
  it("returns a page of comments on readable boards, newest first, with their content's board", async () => {
    const { board, author, postId } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    const staffPost = await createPost(author, staffBoard);
    const deletedPost = await createPost(author, board, {
      deleted_at: day(0),
    });
    const older = await createComment(author, postId, { created_at: day(0) });
    const newer = await createComment(author, postId, { created_at: day(1) });
    await createComment(author, postId, { deleted_at: day(0) });
    await createComment(author, staffPost);
    await createComment(author, deletedPost);

    const response = await api()
      .get('/api/comment/list')
      .set(as(await createUser({ grade: 8 })));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      count: 2,
      rows: [
        {
          ...commentJson(newer, postId, author),
          user: userJson(author),
          content: {
            content_id: postId,
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
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
            board: {
              board_id: board.board_id,
              board_name: board.board_name,
            },
          },
        },
        expect.objectContaining({ comment_id: older }),
      ],
    });
  });

  it("filters by the member's uuid and pages with limit and offset", async () => {
    const { author, postId } = await setup();
    const other = await createUser({ grade: 8 });
    const first = await createComment(author, postId, { created_at: day(0) });
    const second = await createComment(author, postId, { created_at: day(1) });
    await createComment(author, postId, { created_at: day(2) });
    await createComment(other, postId, { created_at: day(3) });

    const response = await api()
      .get('/api/comment/list')
      .query({ user_uuid: author.user_uuid, limit: 2, offset: 1 })
      .set(as(other));

    expect(response.body.count).toBe(3);
    expect(
      response.body.rows.map((row: { comment_id: number }) => row.comment_id),
    ).toEqual([second, first]);
  });

  it('answers 404 for an unknown member', async () => {
    const response = await api()
      .get('/api/comment/list')
      .query({ user_uuid: '00000000-0000-4000-8000-000000000000' })
      .set(as(await createUser()));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('comment reads after the move', () => {
  it("refuses the comments of a content on a board the member can't read", async () => {
    const staffBoard = await createBoard({ lv_read: 6 });
    const author = await createUser({ grade: 6 });
    const postId = await createPost(author, staffBoard);
    await createComment(author, postId);

    const response = await api()
      .get(`/api/content/${postId}/comments`)
      .set(as(await createUser({ grade: 8 })));

    expect(response.status).toBe(403);
  });

  it('answers 404 for an unknown, deleted or non-numeric content, and a malformed member uuid', async () => {
    const { board, author } = await setup();
    const deletedPost = await createPost(author, board, {
      deleted_at: day(0),
    });
    await createComment(author, deletedPost);
    const reader = await createUser();

    const responses = [
      await api().get('/api/content/999999/comments').set(as(reader)),
      await api().get(`/api/content/${deletedPost}/comments`).set(as(reader)),
      await api().get('/api/content/abc/comments').set(as(reader)),
      await api()
        .get('/api/comment/list')
        .query({ user_uuid: 'nope' })
        .set(as(reader)),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      404, 404, 404, 404,
    ]);
  });
});
