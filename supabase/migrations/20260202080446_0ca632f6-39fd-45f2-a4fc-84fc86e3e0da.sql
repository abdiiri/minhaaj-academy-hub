-- Add secular_subjects and arabic_subjects columns to classes table
ALTER TABLE public.classes 
ADD COLUMN secular_subjects text[] DEFAULT '{}'::text[],
ADD COLUMN arabic_subjects text[] DEFAULT '{}'::text[];

-- Migrate existing subjects to secular_subjects
UPDATE public.classes 
SET secular_subjects = COALESCE(subjects, '{}'::text[]);

-- Drop the old subjects column
ALTER TABLE public.classes DROP COLUMN subjects;