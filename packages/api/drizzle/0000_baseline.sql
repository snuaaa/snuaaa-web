CREATE TABLE public.tb_album (
    content_id integer NOT NULL,
    is_private boolean,
    tn_photo_id integer
);
--> statement-breakpoint

CREATE TABLE public.tb_board (
    board_id character varying(16) NOT NULL,
    board_name character varying(32) NOT NULL,
    board_type character varying(16),
    board_desc text,
    menu integer,
    "order" integer,
    lv_read integer,
    lv_write integer,
    lv_edit integer
);
--> statement-breakpoint

CREATE TABLE public.tb_category (
    category_id character varying(16) NOT NULL,
    board_id character varying(16) NOT NULL,
    category_name character varying(32),
    category_color character varying(8)
);
--> statement-breakpoint

CREATE TABLE public.tb_comment (
    comment_id integer NOT NULL,
    comment_uuid uuid,
    parent_id integer NOT NULL,
    parent_comment_id integer,
    author_id integer NOT NULL,
    text text,
    like_num integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_comment_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_comment_comment_id_seq OWNED BY public.tb_comment.comment_id;
--> statement-breakpoint

CREATE TABLE public.tb_comment_like (
    comment_id integer NOT NULL,
    user_id integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE public.tb_content (
    content_id integer NOT NULL,
    content_uuid uuid,
    author_id integer NOT NULL,
    board_id character varying(16),
    category_id character varying(16),
    type character varying(16),
    parent_id integer,
    title character varying(64),
    text text,
    view_num integer DEFAULT 0,
    comment_num integer DEFAULT 0,
    like_num integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_content_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_content_content_id_seq OWNED BY public.tb_content.content_id;
--> statement-breakpoint

CREATE TABLE public.tb_content_like (
    content_id integer NOT NULL,
    user_id integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE public.tb_content_tag (
    content_id integer NOT NULL,
    tag_id character varying(16) NOT NULL
);
--> statement-breakpoint

CREATE TABLE public.tb_document (
    content_id integer NOT NULL,
    generation integer,
    file_path character varying(256)[]
);
--> statement-breakpoint

CREATE TABLE public.tb_equipment (
    id integer NOT NULL,
    category_id integer,
    name character varying(256),
    nickname character varying(256),
    description text,
    location character varying(64),
    maker character varying(64),
    status character varying(16),
    rent_status character varying(16) DEFAULT 'RENTABLE'::character varying,
    img_path character varying(256),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE public.tb_equipment_category (
    id integer NOT NULL,
    name character varying(256),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_equipment_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_equipment_category_id_seq OWNED BY public.tb_equipment_category.id;
--> statement-breakpoint

CREATE SEQUENCE public.tb_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_equipment_id_seq OWNED BY public.tb_equipment.id;
--> statement-breakpoint

CREATE TABLE public.tb_exhibit_photo (
    content_id integer NOT NULL,
    "order" integer,
    photographer_id integer,
    photographer_alt character varying(32),
    file_path character varying(256),
    thumbnail_path character varying(256),
    img_url character varying(256),
    thumbnail_url character varying(256),
    location character varying(256),
    camera character varying(256),
    lens character varying(256),
    exposure_time character varying(256),
    focal_length character varying(32),
    f_stop character varying(8),
    iso character varying(8),
    date timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE public.tb_exhibition (
    content_id integer NOT NULL,
    exhibition_no integer,
    slogan character varying(64),
    date_start timestamp with time zone,
    date_end timestamp with time zone,
    place character varying(64),
    poster_path character varying(256),
    poster_thumbnail_path character varying(256),
    poster_url character varying(256),
    poster_thumbnail_url character varying(256)
);
--> statement-breakpoint

CREATE TABLE public.tb_file (
    file_id integer NOT NULL,
    parent_id integer NOT NULL,
    original_name character varying(256),
    file_path character varying(256),
    file_url character varying(256),
    file_type character varying(16),
    download_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_file_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_file_file_id_seq OWNED BY public.tb_file.file_id;
--> statement-breakpoint

CREATE TABLE public.tb_photo (
    content_id integer NOT NULL,
    file_path character varying(256),
    thumbnail_path character varying(256),
    img_url character varying(256),
    thumbnail_url character varying(256),
    location character varying(256),
    camera character varying(256),
    lens character varying(256),
    exposure_time character varying(256),
    focal_length character varying(32),
    f_stop character varying(8),
    iso character varying(8),
    date timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE public.tb_post (
    content_id integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE public.tb_rent (
    id integer NOT NULL,
    user_id integer NOT NULL,
    equipment_id integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    returned boolean DEFAULT false
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_rent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_rent_id_seq OWNED BY public.tb_rent.id;
--> statement-breakpoint

CREATE TABLE public.tb_rent_return (
    rent_id integer NOT NULL,
    photo_path character varying(256),
    return_date timestamp with time zone,
    penalty_status character varying(16)
);
--> statement-breakpoint

CREATE TABLE public.tb_stats_login (
    user_id integer NOT NULL,
    login_at timestamp with time zone NOT NULL
);
--> statement-breakpoint

CREATE TABLE public.tb_tag (
    tag_id character varying(16) NOT NULL,
    board_id character varying(16) NOT NULL,
    tag_name character varying(32),
    tag_type character varying(8)
);
--> statement-breakpoint

CREATE TABLE public.tb_user (
    user_id integer NOT NULL,
    user_uuid uuid,
    id character varying(16) NOT NULL,
    password character varying(64),
    username character varying(16),
    aaa_no character varying(16),
    nickname character varying(16),
    col_no character varying(8),
    major character varying(32),
    email character varying(64),
    mobile character varying(16),
    introduction text,
    profile_path character varying(256),
    profile_url character varying(256),
    grade integer,
    level integer,
    login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);
--> statement-breakpoint

CREATE SEQUENCE public.tb_user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint

ALTER SEQUENCE public.tb_user_user_id_seq OWNED BY public.tb_user.user_id;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment ALTER COLUMN comment_id SET DEFAULT nextval('public.tb_comment_comment_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content ALTER COLUMN content_id SET DEFAULT nextval('public.tb_content_content_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_equipment ALTER COLUMN id SET DEFAULT nextval('public.tb_equipment_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_equipment_category ALTER COLUMN id SET DEFAULT nextval('public.tb_equipment_category_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_file ALTER COLUMN file_id SET DEFAULT nextval('public.tb_file_file_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent ALTER COLUMN id SET DEFAULT nextval('public.tb_rent_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_user ALTER COLUMN user_id SET DEFAULT nextval('public.tb_user_user_id_seq'::regclass);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_album
    ADD CONSTRAINT tb_album_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_board
    ADD CONSTRAINT tb_board_pkey PRIMARY KEY (board_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_category
    ADD CONSTRAINT tb_category_pkey PRIMARY KEY (category_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment_like
    ADD CONSTRAINT tb_comment_like_comment_id_key UNIQUE (comment_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment_like
    ADD CONSTRAINT tb_comment_like_pkey PRIMARY KEY (comment_id, user_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment_like
    ADD CONSTRAINT tb_comment_like_user_id_key UNIQUE (user_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment
    ADD CONSTRAINT tb_comment_pkey PRIMARY KEY (comment_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_like
    ADD CONSTRAINT tb_content_like_pkey PRIMARY KEY (content_id, user_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content
    ADD CONSTRAINT tb_content_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_tag
    ADD CONSTRAINT tb_content_tag_pkey PRIMARY KEY (content_id, tag_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_document
    ADD CONSTRAINT tb_document_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_equipment_category
    ADD CONSTRAINT tb_equipment_category_pkey PRIMARY KEY (id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_equipment
    ADD CONSTRAINT tb_equipment_pkey PRIMARY KEY (id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_exhibit_photo
    ADD CONSTRAINT tb_exhibit_photo_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_exhibition
    ADD CONSTRAINT tb_exhibition_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_file
    ADD CONSTRAINT tb_file_pkey PRIMARY KEY (file_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_photo
    ADD CONSTRAINT tb_photo_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_post
    ADD CONSTRAINT tb_post_pkey PRIMARY KEY (content_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent
    ADD CONSTRAINT tb_rent_pkey PRIMARY KEY (id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent_return
    ADD CONSTRAINT tb_rent_return_pkey PRIMARY KEY (rent_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_stats_login
    ADD CONSTRAINT tb_stats_login_pkey PRIMARY KEY (user_id, login_at);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_tag
    ADD CONSTRAINT tb_tag_pkey PRIMARY KEY (tag_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_user
    ADD CONSTRAINT tb_user_pkey PRIMARY KEY (user_id);
--> statement-breakpoint

ALTER TABLE ONLY public.tb_album
    ADD CONSTRAINT tb_album_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_album
    ADD CONSTRAINT tb_album_tn_photo_id_fkey FOREIGN KEY (tn_photo_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_category
    ADD CONSTRAINT tb_category_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.tb_board(board_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment
    ADD CONSTRAINT tb_comment_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment_like
    ADD CONSTRAINT tb_comment_like_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.tb_comment(comment_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment_like
    ADD CONSTRAINT tb_comment_like_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_comment(comment_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment
    ADD CONSTRAINT tb_comment_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.tb_comment(comment_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_comment
    ADD CONSTRAINT tb_comment_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content
    ADD CONSTRAINT tb_content_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content
    ADD CONSTRAINT tb_content_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.tb_board(board_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content
    ADD CONSTRAINT tb_content_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.tb_category(category_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_like
    ADD CONSTRAINT tb_content_like_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_like
    ADD CONSTRAINT tb_content_like_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content
    ADD CONSTRAINT tb_content_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_tag
    ADD CONSTRAINT tb_content_tag_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_content_tag
    ADD CONSTRAINT tb_content_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tb_tag(tag_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_document
    ADD CONSTRAINT tb_document_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_equipment
    ADD CONSTRAINT tb_equipment_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.tb_equipment_category(id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_exhibit_photo
    ADD CONSTRAINT tb_exhibit_photo_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_exhibit_photo
    ADD CONSTRAINT tb_exhibit_photo_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_exhibition
    ADD CONSTRAINT tb_exhibition_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_file
    ADD CONSTRAINT tb_file_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_photo
    ADD CONSTRAINT tb_photo_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_post
    ADD CONSTRAINT tb_post_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.tb_content(content_id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent
    ADD CONSTRAINT tb_rent_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.tb_equipment(id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent_return
    ADD CONSTRAINT tb_rent_return_rent_id_fkey FOREIGN KEY (rent_id) REFERENCES public.tb_rent(id) ON UPDATE CASCADE ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_rent
    ADD CONSTRAINT tb_rent_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_stats_login
    ADD CONSTRAINT tb_stats_login_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(user_id) ON UPDATE CASCADE;
--> statement-breakpoint

ALTER TABLE ONLY public.tb_tag
    ADD CONSTRAINT tb_tag_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.tb_board(board_id) ON UPDATE CASCADE ON DELETE CASCADE;
