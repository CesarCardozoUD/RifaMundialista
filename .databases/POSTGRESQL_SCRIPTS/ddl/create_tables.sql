create table matches (
  id uuid primary key default gen_random_uuid(),
  team_a text not null,
  team_b text not null,
  match_date timestamptz not null,
  state varchar(10) not null,
  team_a_score text,
  team_b_score text,
  group_id varchar(1) not null
)

create table users (
  id uuid primary key default gen_random_uuid(),
  mail text not null unique,
  username text not null,
  created_at timestamptz not null,
  status text not null,
  password text not null
)

create table prediction(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  match_id uuid not null,
  team_a_score int not null,
  team_b_score int not null,
)

create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  total_score int not null default 0
)

create table prediction_result(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  match_id uuid not null,
  predicted_final text not null,
  real_final text not null,
  earned_points int not null
)