CREATE POLICY "Anyone can read matches"
ON matches
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read predictions"
ON prediction
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read scores"
ON scores
FOR SELECT
USING (true);
