ALTER TABLE public.conversation_participants
ADD COLUMN IF NOT EXISTS last_read_at timestamp with time zone NOT NULL DEFAULT now();

DROP POLICY IF EXISTS "Users can update their own read state" ON public.conversation_participants;
CREATE POLICY "Users can update their own read state"
ON public.conversation_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.messages REPLICA IDENTITY FULL;