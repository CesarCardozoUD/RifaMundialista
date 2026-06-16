create or replace function init_user()
returns uuid
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
begin

  insert into users (mail, username, created_at, status, password)
  values(CAST(gen_random_uuid() as text), 'INIT', now(), 'pending', 'INIT')
  returning id into new_user_id;

  return new_user_id;

end;
$$