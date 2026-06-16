create or replace function load_leaderboard()
returns table (
  username text,
  total_score int
) 
language plpgsql
security definer
as $$
begin

	return query
  select u.username, s.total_score 
  from scores s
  inner join users u on u.id = s.user_id
  order by s.total_score desc;
  
end;
$$;