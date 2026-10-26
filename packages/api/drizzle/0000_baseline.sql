CREATE TABLE "tb_album" (
	"content_id" integer PRIMARY KEY NOT NULL,
	"is_private" boolean,
	"tn_photo_id" integer
);
--> statement-breakpoint
CREATE TABLE "tb_board" (
	"board_id" varchar(16) PRIMARY KEY NOT NULL,
	"board_name" varchar(32) NOT NULL,
	"board_type" varchar(16),
	"board_desc" text,
	"menu" integer,
	"order" integer,
	"lv_read" integer,
	"lv_write" integer,
	"lv_edit" integer
);
--> statement-breakpoint
CREATE TABLE "tb_category" (
	"category_id" varchar(16) PRIMARY KEY NOT NULL,
	"board_id" varchar(16) NOT NULL,
	"category_name" varchar(32),
	"category_color" varchar(8)
);
--> statement-breakpoint
CREATE TABLE "tb_comment" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"comment_uuid" uuid,
	"parent_id" integer NOT NULL,
	"parent_comment_id" integer,
	"author_id" integer NOT NULL,
	"text" text,
	"like_num" integer DEFAULT 0,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_comment_like" (
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "tb_comment_like_pkey" PRIMARY KEY("comment_id","user_id"),
	CONSTRAINT "tb_comment_like_comment_id_key" UNIQUE("comment_id"),
	CONSTRAINT "tb_comment_like_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_content" (
	"content_id" serial PRIMARY KEY NOT NULL,
	"content_uuid" uuid,
	"author_id" integer NOT NULL,
	"board_id" varchar(16),
	"category_id" varchar(16),
	"type" varchar(16),
	"parent_id" integer,
	"title" varchar(64),
	"text" text,
	"view_num" integer DEFAULT 0,
	"comment_num" integer DEFAULT 0,
	"like_num" integer DEFAULT 0,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_content_like" (
	"content_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "tb_content_like_pkey" PRIMARY KEY("content_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_content_tag" (
	"content_id" integer NOT NULL,
	"tag_id" varchar(16) NOT NULL,
	CONSTRAINT "tb_content_tag_pkey" PRIMARY KEY("content_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tb_document" (
	"content_id" integer PRIMARY KEY NOT NULL,
	"generation" integer,
	"file_path" varchar(256)[]
);
--> statement-breakpoint
CREATE TABLE "tb_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" varchar(256),
	"nickname" varchar(256),
	"description" text,
	"location" varchar(64),
	"maker" varchar(64),
	"status" varchar(16),
	"rent_status" varchar(16) DEFAULT 'RENTABLE',
	"img_path" varchar(256),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_equipment_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_exhibit_photo" (
	"content_id" integer PRIMARY KEY NOT NULL,
	"order" integer,
	"photographer_id" integer,
	"photographer_alt" varchar(32),
	"file_path" varchar(256),
	"thumbnail_path" varchar(256),
	"img_url" varchar(256),
	"thumbnail_url" varchar(256),
	"location" varchar(256),
	"camera" varchar(256),
	"lens" varchar(256),
	"exposure_time" varchar(256),
	"focal_length" varchar(32),
	"f_stop" varchar(8),
	"iso" varchar(8),
	"date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_exhibition" (
	"content_id" integer PRIMARY KEY NOT NULL,
	"exhibition_no" integer,
	"slogan" varchar(64),
	"date_start" timestamp with time zone,
	"date_end" timestamp with time zone,
	"place" varchar(64),
	"poster_path" varchar(256),
	"poster_thumbnail_path" varchar(256),
	"poster_url" varchar(256),
	"poster_thumbnail_url" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "tb_file" (
	"file_id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"original_name" varchar(256),
	"file_path" varchar(256),
	"file_url" varchar(256),
	"file_type" varchar(16),
	"download_count" integer DEFAULT 0,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_photo" (
	"content_id" integer PRIMARY KEY NOT NULL,
	"file_path" varchar(256),
	"thumbnail_path" varchar(256),
	"img_url" varchar(256),
	"thumbnail_url" varchar(256),
	"location" varchar(256),
	"camera" varchar(256),
	"lens" varchar(256),
	"exposure_time" varchar(256),
	"focal_length" varchar(32),
	"f_stop" varchar(8),
	"iso" varchar(8),
	"date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tb_post" (
	"content_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_rent" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"equipment_id" integer NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"returned" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "tb_rent_return" (
	"rent_id" integer PRIMARY KEY NOT NULL,
	"photo_path" varchar(256),
	"return_date" timestamp with time zone,
	"penalty_status" varchar(16)
);
--> statement-breakpoint
CREATE TABLE "tb_stats_login" (
	"user_id" integer NOT NULL,
	"login_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tb_stats_login_pkey" PRIMARY KEY("user_id","login_at")
);
--> statement-breakpoint
CREATE TABLE "tb_tag" (
	"tag_id" varchar(16) PRIMARY KEY NOT NULL,
	"board_id" varchar(16) NOT NULL,
	"tag_name" varchar(32),
	"tag_type" varchar(8)
);
--> statement-breakpoint
CREATE TABLE "tb_user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"user_uuid" uuid,
	"id" varchar(16) NOT NULL,
	"password" varchar(64),
	"username" varchar(16),
	"aaa_no" varchar(16),
	"nickname" varchar(16),
	"col_no" varchar(8),
	"major" varchar(32),
	"email" varchar(64),
	"mobile" varchar(16),
	"introduction" text,
	"profile_path" varchar(256),
	"profile_url" varchar(256),
	"grade" integer,
	"level" integer,
	"login_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "tb_album" ADD CONSTRAINT "tb_album_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_album" ADD CONSTRAINT "tb_album_tn_photo_id_fkey" FOREIGN KEY ("tn_photo_id") REFERENCES "public"."tb_content"("content_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_category" ADD CONSTRAINT "tb_category_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."tb_board"("board_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_comment" ADD CONSTRAINT "tb_comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tb_content"("content_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_comment" ADD CONSTRAINT "tb_comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."tb_comment"("comment_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_comment" ADD CONSTRAINT "tb_comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."tb_user"("user_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_comment_like" ADD CONSTRAINT "tb_comment_like_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."tb_comment"("comment_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_comment_like" ADD CONSTRAINT "tb_comment_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."tb_comment"("comment_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."tb_user"("user_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."tb_board"("board_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."tb_category"("category_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tb_content"("content_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content_like" ADD CONSTRAINT "tb_content_like_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content_like" ADD CONSTRAINT "tb_content_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."tb_user"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content_tag" ADD CONSTRAINT "tb_content_tag_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_content_tag" ADD CONSTRAINT "tb_content_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tb_tag"("tag_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_document" ADD CONSTRAINT "tb_document_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_equipment" ADD CONSTRAINT "tb_equipment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."tb_equipment_category"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_exhibit_photo" ADD CONSTRAINT "tb_exhibit_photo_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_exhibit_photo" ADD CONSTRAINT "tb_exhibit_photo_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "public"."tb_user"("user_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_exhibition" ADD CONSTRAINT "tb_exhibition_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_file" ADD CONSTRAINT "tb_file_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tb_content"("content_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_photo" ADD CONSTRAINT "tb_photo_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_post" ADD CONSTRAINT "tb_post_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."tb_content"("content_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_rent" ADD CONSTRAINT "tb_rent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."tb_user"("user_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_rent" ADD CONSTRAINT "tb_rent_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."tb_equipment"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_rent_return" ADD CONSTRAINT "tb_rent_return_rent_id_fkey" FOREIGN KEY ("rent_id") REFERENCES "public"."tb_rent"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_stats_login" ADD CONSTRAINT "tb_stats_login_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."tb_user"("user_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tb_tag" ADD CONSTRAINT "tb_tag_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."tb_board"("board_id") ON DELETE cascade ON UPDATE cascade;