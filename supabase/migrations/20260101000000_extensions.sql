-- Extensions: uuid generation + case-insensitive text + pgcrypto (for digest/gen_random_uuid)
-- Runnable independently. Reversible.

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "citext" with schema extensions;

-- down:
--   drop extension if exists "citext";
--   drop extension if exists "uuid-ossp";
--   drop extension if exists "pgcrypto";
