-- Custom SQL migration file, put your code below! --
-- Attached files live in tb_attached_file. The 8 prod documents with paths
-- here were checked to have the same files there (2026-11-21).
ALTER TABLE tb_document DROP COLUMN IF EXISTS file_path;
