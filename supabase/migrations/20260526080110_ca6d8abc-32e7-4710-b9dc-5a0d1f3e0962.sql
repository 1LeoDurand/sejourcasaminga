CREATE POLICY "Preferences viewable by everyone"
ON public.user_preferences
FOR SELECT
TO public
USING (true);