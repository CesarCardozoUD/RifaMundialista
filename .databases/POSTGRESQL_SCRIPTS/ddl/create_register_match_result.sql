create or replace function register_match_result(
  p_match_id uuid,
  p_team_a_score int,
  p_team_b_score int
)

returns void
language plpgsql
security definer

as $$
declare
  prediction_record record;
  earned_points int;
  predicted_final_text text;
  real_final_text text;
  v_multiplier int;

begin
  -- actualizar partido
  update matches
  set
    team_a_score = p_team_a_score,
    team_b_score = p_team_b_score,
    state = 'FINISHED'
  where id = p_match_id;
  
  -- obtener multiplicador
  select multiplier
  into v_multiplier
  from matches
  where id = p_match_id;

  -- recorrer predicciones
  for prediction_record in (
    select *
    from prediction
    where match_id = p_match_id
  )

  loop
    earned_points := 0;
    -- marcador exacto
    if (
      prediction_record.team_a_score = p_team_a_score
      and
      prediction_record.team_b_score = p_team_b_score
    ) then
      earned_points := 2 * v_multiplier;
      
    -- acertó ganador/empate
    elsif (
      (
        prediction_record.team_a_score > prediction_record.team_b_score
        and
        p_team_a_score > p_team_b_score
      )
      or
      (
        prediction_record.team_a_score < prediction_record.team_b_score
        and
        p_team_a_score < p_team_b_score
      )
      or
      (
        prediction_record.team_a_score = prediction_record.team_b_score
        and
        p_team_a_score = p_team_b_score
      )
    ) then
      earned_points := 1 * v_multiplier;
    end if;

    predicted_final_text := 'team_a:'|| prediction_record.team_a_score|| '-team_b:'|| prediction_record.team_b_score;
    real_final_text := 'team_a:' || p_team_a_score || '-team_b:' || p_team_b_score;

    insert into prediction_result (
      user_id,
      match_id,
      predicted_final,
      real_final,
      earned_points
    )
    values (
      prediction_record.user_id,
      p_match_id,
      predicted_final_text,
      real_final_text,
      earned_points
    )
    on conflict (user_id, match_id)
    do update set
      predicted_final = excluded.predicted_final,
      real_final = excluded.real_final,
      earned_points = excluded.earned_points;
  end loop;
end;
$$;