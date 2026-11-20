-- Up Migration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email VARCHAR(225) NOT NULL,

  password_hash TEXT NOT NULL,

  first_name VARCHAR(30) NOT NULL CHECK (trim(first_name) != ''),
  last_name VARCHAR(30) NOT NULL CHECK (trim(last_name) != ''),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Down Migration
DROP INDEX users_email_lower_idx;

DROP TABLE users;
