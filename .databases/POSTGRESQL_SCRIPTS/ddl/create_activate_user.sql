create or replace function activate_user(
  p_user_id uuid,
  p_mail text,
  p_username text,
  p_password_hash text
)
returns boolean
language plpgsql
security definer
as $$
begin

  update users
  set
    mail = p_mail,
    username = p_username,
    password = p_password_hash,
    status = 'active'
  where
    id = p_user_id
    and status = 'pending';

  if not found then
    raise exception 'Invalid or already registered user';
  end if;
  
  insert into scores (user_id, total_score)
  values (p_user_id, 0);

  return true;

end;
$$;