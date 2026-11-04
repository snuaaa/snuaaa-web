-- Custom SQL migration file, put your code below! --
-- The Comment model defaults like_num to 0, but prod never had the column default.
UPDATE tb_comment SET like_num = 0 WHERE like_num IS NULL;
--> statement-breakpoint
ALTER TABLE tb_comment ALTER COLUMN like_num SET DEFAULT 0;
