import React from 'react';
import { Link } from '@tanstack/react-router';
import { convertDate } from '../../utils/convertDate';
import { Content } from '~/services/types';

function PostList({ posts }: { posts: Content[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-black/4">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/4 overflow-hidden mb-6">
      {/* Table Header */}
      <div className="hidden md:flex items-center px-6 py-4 bg-gray-50 border-b border-gray-200 text-[13px] font-bold text-gray-500 tracking-wider">
        <div className="flex-1">제목</div>
        <div className="w-28 text-center">작성자</div>
        <div className="w-24 text-center">작성일</div>
        <div className="w-16 text-center">추천</div>
        <div className="w-16 text-center">댓글</div>
      </div>

      {/* Post Items */}
      <div className="flex flex-col">
        {posts.map((post) => (
          <Link
            key={post.content_id}
            to="/post/$post_id"
            params={{ post_id: String(post.content_id) }}
            className="flex flex-col md:flex-row md:items-center px-6 py-4 border-b last:border-0 border-black/4 hover:bg-gray-50/50 transition-colors group"
          >
            {/* Title & Metadata (Mobile) */}
            <div className="flex-1 min-w-0 mb-2 md:mb-0">
              <h5 className="text-[15.5px] font-medium text-gray-900 group-hover:text-aqua-500 transition-colors truncate">
                {post.title}
              </h5>

              {/* Mobile Metadata */}
              <div className="flex items-center gap-3 mt-1.5 md:hidden text-[12px] text-gray-400">
                <span>{post.user?.nickname}</span>
                <span>{convertDate(post.createdAt)}</span>
                <span className="flex items-center gap-1 text-pink-500">
                  <i className="ri-heart-fill"></i> {post.like_num}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <i className="ri-message-2-fill"></i> {post.comment_num}
                </span>
              </div>
            </div>

            {/* Desktop Columns */}
            <div className="hidden md:flex items-center text-[13.5px] text-gray-600">
              <div className="w-28 text-center truncate px-2">
                {post.user?.nickname}
              </div>
              <div className="w-24 text-center text-gray-400">
                {convertDate(post.createdAt)}
              </div>
              <div className="w-16 flex items-center justify-center font-medium">
                {post.like_num > 0 ? (
                  <span className="text-pink-500 flex items-center gap-1.5">
                    <i className="ri-heart-fill"></i> {post.like_num}
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </div>
              <div className="w-16 flex items-center justify-center font-medium">
                {post.comment_num > 0 ? (
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <i className="ri-message-2-fill"></i> {post.comment_num}
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PostList;
