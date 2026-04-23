-- JWT secret for PostgREST signature verification. Reads from the env var
-- JWT_SECRET that the Postgres container receives.
\set jwt_secret `echo "$JWT_SECRET"`
\set jwt_exp    `echo "$JWT_EXP"`

alter database postgres set "app.settings.jwt_secret" to :'jwt_secret';
alter database postgres set "app.settings.jwt_exp"    to :'jwt_exp';
