-- Up Migration
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  status TEXT NOT NULL CHECK (status IN ('published', 'archived', 'deleted')) DEFAULT 'published',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'followers-only')) DEFAULT 'public',
  comment_policy TEXT NOT NULL CHECK (comment_policy IN ('public', 'followers-only', 'none')) DEFAULT 'public',

  constraint title_not_blank CHECK (length(trim(title)) > 0),
  constraint title_max_length CHECK (length(trim(title)) <= 200),
  constraint comments_not_wider_than_visibility CHECK (
    visibility = 'public' OR comment_policy <> 'public'
  ),
  constraint published_has_no_end_timestamps CHECK (
    status <> 'published' OR (archived_at IS NULL AND deleted_at IS NULL)
  ),
  constraint archived_has_timestamp CHECK (status <> 'archived' OR archived_at IS NOT NULL),
  constraint deleted_has_timestamp  CHECK (status <> 'deleted'  OR deleted_at  IS NOT NULL)
);

-- Down Migration
DROP TABLE posts;
