create or replace function login_user(
  p_user text,
  p_password_hash text
)
returns setof users
language sql
security definer
as $$
  select *
  from users
  where
    (username = p_user or mail = p_user)
    and password = p_password_hash
    and status = 'active';
$$;