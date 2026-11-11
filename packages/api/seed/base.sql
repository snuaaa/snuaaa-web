-- Base data for a local development DB: boards, categories, tags and
-- equipment categories, copied from the dev DB on 2026-11-11.
-- Applied by `pnpm db:seed` (src/db/seed.ts). Never run this on dev or prod.
-- Every insert skips rows that already exist, so it is safe to run again.

-- tb_board goes first, because tb_category and tb_tag reference it.
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd06', '후기게시판', 'N', NULL, 2, 4, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd21', '문서게시판', 'D', '동아리의 문서자료들', 3, 2, 8, 7, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd91', '관리자에게', 'N', '버그 제보, 개선 의견, 관리자에게 하고 싶은 말', 2, 6, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd01', '소리통', 'N', '동아리의 공식 행사 안내입니다.', 1, 1, 8, 6, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd08', '일지게시판', 'N', '임모일지, 별모임일지, 자율돔관일지 등', 3, 1, 8, 7, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd03', '잡기장', 'N', '온라인 잡기장! 아무 글이나 작성하셔도 좋습니다.', 2, 1, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd05', '관측정보', 'N', '관측과 관련된 정보들', 2, 3, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd32', '별사진', 'A', NULL, 4, 2, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd31', '추억 만들기', 'M', '동아리의 추억들을 사진으로 만나보세요~', 4, 1, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd07', '시그너스', 'N', NULL, 0, 5, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd04', '모임게시판', 'N', NULL, 0, 2, 8, 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd41', '사진전', 'E', '동아리 역대 사진전', 4, 3, 10, 6, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd92', '손님방', 'N', NULL, 0, NULL, 10, 9, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd99', 'Dev.log', 'N', NULL, 3, 3, 8, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd98', 'Secret', 'N', NULL, 0, NULL, 1, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd02', '공지게시판', 'N', '행사를 제외한 동아리의 각종 공지사항.', 1, 2, 8, 7, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_board (board_id, board_name, board_type, board_desc, menu, "order", lv_read, lv_write, lv_edit) VALUES ('brd10', '자기소개', 'N', NULL, 2, 5, 8, 8, 1) ON CONFLICT DO NOTHING;

INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg001', 'brd31', '행사', '#FF5273') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg003', 'brd31', '친목', '#74B9FF') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg002', 'brd31', '관측', '#FFD373') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg004', 'brd21', 'LT', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg005', 'brd21', '총회', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg006', 'brd21', '선본', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg007', 'brd21', '기타', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg008', 'brd21', '디딤돌', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_category (category_id, board_id, category_name, category_color) VALUES ('ctg009', 'brd21', '사진전', NULL) ON CONFLICT DO NOTHING;

INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag001', 'brd32', '고정촬영', 'M') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag002', 'brd32', '가이드', 'M') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag003', 'brd32', '필름', 'M') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag004', 'brd32', '별자리', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag005', 'brd32', '별풍경', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag006', 'brd32', '별궤적', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag007', 'brd32', '딥스카이', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag008', 'brd32', '천문현상', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag009', 'brd32', '태양계', 'T') ON CONFLICT DO NOTHING;
INSERT INTO public.tb_tag (tag_id, board_id, tag_name, tag_type) VALUES ('tag011', 'brd32', '어포컬', 'M') ON CONFLICT DO NOTHING;

INSERT INTO public.tb_equipment_category (id, name, created_at, updated_at, deleted_at) VALUES (1, '망원경', '2025-03-22 14:45:34.178+00', '2025-03-22 14:45:34.178+00', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.tb_equipment_category (id, name, created_at, updated_at, deleted_at) VALUES (2, '가대', '2025-03-22 14:45:38.591+00', '2025-03-22 14:45:38.591+00', NULL) ON CONFLICT DO NOTHING;

SELECT setval('public.tb_equipment_category_id_seq', (SELECT max(id) FROM public.tb_equipment_category));
