create or replace function save_predictions(
  p_predictions jsonb
)
returns void
language plpgsql
security definer
as $$
begin

  insert into prediction (
    user_id,
    match_id,
    team_a_score,
    team_b_score
  )
  select
    (item->>'user_id')::uuid,
    (item->>'match_id')::uuid,
    (item->>'team_a_score')::int,
    (item->>'team_b_score')::int
  from jsonb_array_elements(
    p_predictions
  ) as item

  on conflict (user_id, match_id)
  do update set
    team_a_score = excluded.team_a_score,
    team_b_score = excluded.team_b_score;

end;
$$;