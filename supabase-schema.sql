-- Supabase Database Schema for Skills Organizer
-- This file contains the SQL schema to recreate the Firebase Realtime Database structure in PostgreSQL

-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create userdata table
CREATE TABLE IF NOT EXISTS public.userdata (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  email TEXT,
  locale TEXT DEFAULT 'en',
  nodes_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  description TEXT,
  access BOOLEAN DEFAULT true,
  status TEXT DEFAULT '1',
  dependencies_satisfied BOOLEAN DEFAULT true,
  radius INTEGER DEFAULT 50,
  top INTEGER DEFAULT 0,
  left_pos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_nodes table
CREATE TABLE IF NOT EXISTS public.template_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  description TEXT,
  access BOOLEAN DEFAULT true,
  status TEXT DEFAULT '1',
  dependencies_satisfied BOOLEAN DEFAULT true,
  radius INTEGER DEFAULT 50,
  top INTEGER DEFAULT 0,
  left_pos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dependencies table
CREATE TABLE IF NOT EXISTS public.dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  from_node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_dependencies table
CREATE TABLE IF NOT EXISTS public.template_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  from_node_id UUID REFERENCES public.template_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.template_nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON public.nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_template_nodes_template_id ON public.template_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_user_id ON public.dependencies(user_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_from_node ON public.dependencies(from_node_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_to_node ON public.dependencies(to_node_id);
CREATE INDEX IF NOT EXISTS idx_template_dependencies_template_id ON public.template_dependencies(template_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.userdata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Userdata policies
CREATE POLICY "Users can view own userdata" ON public.userdata
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own userdata" ON public.userdata
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own userdata" ON public.userdata
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Nodes policies
CREATE POLICY "Users can view own nodes" ON public.nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nodes" ON public.nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes" ON public.nodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nodes" ON public.nodes
  FOR DELETE USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view own templates" ON public.templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

-- Template nodes policies
CREATE POLICY "Users can view template nodes" ON public.template_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_nodes.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert template nodes" ON public.template_nodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_nodes.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update template nodes" ON public.template_nodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_nodes.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template nodes" ON public.template_nodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_nodes.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Dependencies policies
CREATE POLICY "Users can view own dependencies" ON public.dependencies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dependencies" ON public.dependencies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dependencies" ON public.dependencies
  FOR DELETE USING (auth.uid() = user_id);

-- Template dependencies policies
CREATE POLICY "Users can view template dependencies" ON public.template_dependencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_dependencies.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert template dependencies" ON public.template_dependencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_dependencies.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template dependencies" ON public.template_dependencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_dependencies.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_userdata_updated_at BEFORE UPDATE ON public.userdata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_nodes_updated_at BEFORE UPDATE ON public.template_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
