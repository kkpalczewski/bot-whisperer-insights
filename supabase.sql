
-- This is an example SQL schema for your Supabase project
-- You can use this when setting up Supabase

-- Create the fingerprints table
CREATE TABLE public.fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Create a foreign key to the Supabase auth.users table
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Set up row-level security
ALTER TABLE public.fingerprints ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own fingerprints
CREATE POLICY "Users can insert their own fingerprints"
  ON public.fingerprints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to read their own fingerprints
CREATE POLICY "Users can view their own fingerprints"
  ON public.fingerprints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Set up API functions
-- This is just an example; you would implement these when you connect Supabase
