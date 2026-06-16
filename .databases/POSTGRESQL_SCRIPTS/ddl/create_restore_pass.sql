create or replace function restore_pass(
  p_user_id uuid,
  p_password_hash text
)
returns boolean
language plpgsql
security definer
as $$
begin

  update users
  set
    password = p_password_hash
  where
    id = p_user_id;

  if not found then
    raise exception 'Invalid or already registered user';
  end if;

  return true;

end;
$$
