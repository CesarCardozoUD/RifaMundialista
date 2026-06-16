alter table prediction
add constraint fk_user_prediction
foreign key (user_id)
references users(id);

alter table prediction
add constraint fk_match_prediction
foreign key (match_id)
references matches(id);

alter table scores
add constraint fk_user_scores
foreign key (user_id)
references users(id);

alter table prediction
add constraint unique_user_match
unique (user_id, match_id);

alter table prediction_result
add constraint uniq_prediction_result
unique(user_id, match_id);