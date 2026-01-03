-- Supabase Database Schema for Skills Organizer
-- This file contains the SQL schema to recreate the Firebase Realtime Database structure in PostgreSQL

-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Table: dependencies
CREATE TABLE IF NOT EXISTS dependencies (
    id uuid NOT NULL,
    user_id uuid,
    from_node_id uuid,
    to_node_id uuid,
    created_at timestamp with time zone
);

-- Table: nodes
CREATE TABLE IF NOT EXISTS nodes (
    id uuid NOT NULL,
    user_id uuid,
    title text NOT NULL,
    type text,
    description text,
    access boolean,
    status text,
    dependencies_satisfied boolean,
    radius integer,
    top integer,
    left_pos integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

-- Table: template_dependencies
CREATE TABLE IF NOT EXISTS template_dependencies (
    id uuid NOT NULL,
    template_id uuid,
    from_node_id uuid,
    to_node_id uuid,
    created_at timestamp with time zone
);

-- Table: template_nodes
CREATE TABLE IF NOT EXISTS template_nodes (
    id uuid NOT NULL,
    template_id uuid,
    title text NOT NULL,
    type text,
    description text,
    access boolean,
    status text,
    dependencies_satisfied boolean,
    radius integer,
    top integer,
    left_pos integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

-- Table: templates
CREATE TABLE IF NOT EXISTS templates (
    id uuid NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text,
    access boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

-- Table: user_tours
CREATE TABLE IF NOT EXISTS user_tours (
    id uuid NOT NULL,
    user_id uuid,
    tour_name text NOT NULL,
    completed boolean,
    completed_at timestamp with time zone,
    created_at timestamp with time zone
);

-- Table: userdata
CREATE TABLE IF NOT EXISTS userdata (
    id uuid NOT NULL,
    email text,
    locale text,
    nodes_updated_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL,
    email text,
    display_name text,
    photo_url text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

-- Primary Key: dependencies_pkey
ALTER TABLE dependencies
ADD CONSTRAINT dependencies_pkey
PRIMARY KEY (id);

-- Primary Key: nodes_pkey
ALTER TABLE nodes
ADD CONSTRAINT nodes_pkey
PRIMARY KEY (id);

-- Primary Key: template_dependencies_pkey
ALTER TABLE template_dependencies
ADD CONSTRAINT template_dependencies_pkey
PRIMARY KEY (id);

-- Primary Key: template_nodes_pkey
ALTER TABLE template_nodes
ADD CONSTRAINT template_nodes_pkey
PRIMARY KEY (id);

-- Primary Key: templates_pkey
ALTER TABLE templates
ADD CONSTRAINT templates_pkey
PRIMARY KEY (id);

-- Primary Key: user_tours_pkey
ALTER TABLE user_tours
ADD CONSTRAINT user_tours_pkey
PRIMARY KEY (id);

-- Primary Key: userdata_pkey
ALTER TABLE userdata
ADD CONSTRAINT userdata_pkey
PRIMARY KEY (id);

-- Primary Key: users_pkey
ALTER TABLE users
ADD CONSTRAINT users_pkey
PRIMARY KEY (id, id);

-- Foreign Key: dependencies_from_node_id_fkey
ALTER TABLE dependencies
ADD CONSTRAINT dependencies_from_node_id_fkey
FOREIGN KEY (from_node_id)
REFERENCES nodes(id) ON DELETE CASCADE;

-- Foreign Key: dependencies_to_node_id_fkey
ALTER TABLE dependencies
ADD CONSTRAINT dependencies_to_node_id_fkey
FOREIGN KEY (to_node_id)
REFERENCES nodes(id) ON DELETE CASCADE;

-- Foreign Key: dependencies_user_id_fkey
ALTER TABLE dependencies
ADD CONSTRAINT dependencies_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

-- Foreign Key: nodes_user_id_fkey
ALTER TABLE nodes
ADD CONSTRAINT nodes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

-- Foreign Key: template_dependencies_from_node_id_fkey
ALTER TABLE template_dependencies
ADD CONSTRAINT template_dependencies_from_node_id_fkey
FOREIGN KEY (from_node_id)
REFERENCES template_nodes(id) ON DELETE CASCADE;

-- Foreign Key: template_dependencies_template_id_fkey
ALTER TABLE template_dependencies
ADD CONSTRAINT template_dependencies_template_id_fkey
FOREIGN KEY (template_id)
REFERENCES templates(id) ON DELETE CASCADE;

-- Foreign Key: template_dependencies_to_node_id_fkey
ALTER TABLE template_dependencies
ADD CONSTRAINT template_dependencies_to_node_id_fkey
FOREIGN KEY (to_node_id)
REFERENCES template_nodes(id) ON DELETE CASCADE;

-- Foreign Key: template_nodes_template_id_fkey
ALTER TABLE template_nodes
ADD CONSTRAINT template_nodes_template_id_fkey
FOREIGN KEY (template_id)
REFERENCES templates(id) ON DELETE CASCADE;

-- Foreign Key: templates_user_id_fkey
ALTER TABLE templates
ADD CONSTRAINT templates_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

-- Foreign Key: userdata_id_fkey
ALTER TABLE userdata
ADD CONSTRAINT userdata_id_fkey
FOREIGN KEY (id)
REFERENCES users(id);

-- Index: idx_dependencies_from_node
CREATE INDEX idx_dependencies_from_node ON public.dependencies USING btree (from_node_id);

-- Index: idx_dependencies_to_node
CREATE INDEX idx_dependencies_to_node ON public.dependencies USING btree (to_node_id);

-- Index: idx_dependencies_user_id
CREATE INDEX idx_dependencies_user_id ON public.dependencies USING btree (user_id);

-- Index: idx_nodes_user_id
CREATE INDEX idx_nodes_user_id ON public.nodes USING btree (user_id);

-- Index: idx_template_dependencies_template_id
CREATE INDEX idx_template_dependencies_template_id ON public.template_dependencies USING btree (template_id);

-- Index: idx_template_nodes_template_id
CREATE INDEX idx_template_nodes_template_id ON public.template_nodes USING btree (template_id);

-- Index: idx_templates_user_id
CREATE INDEX idx_templates_user_id ON public.templates USING btree (user_id);

-- Index: user_tours_user_id_tour_name_key
CREATE UNIQUE INDEX user_tours_user_id_tour_name_key ON public.user_tours USING btree (user_id, tour_name);

-- Function: delete_template
CREATE OR REPLACE FUNCTION delete_template(template_uuid uuid, user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
AS $BODY$
CREATE OR REPLACE FUNCTION public.delete_template(template_uuid uuid, user_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Проверяем права доступа
  IF NOT EXISTS (SELECT 1 FROM templates WHERE id = template_uuid AND user_id = user_uuid) THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;
  
  -- Удаляем зависимости
  DELETE FROM template_dependencies WHERE template_id = template_uuid;
  
  -- Удаляем узлы
  DELETE FROM template_nodes WHERE template_id = template_uuid;
  
  -- Удаляем шаблон
  DELETE FROM templates WHERE id = template_uuid;
END;
$function$

$BODY$;

-- Function: generate_complete_schema_dump
CREATE OR REPLACE FUNCTION generate_complete_schema_dump()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
AS $BODY$
CREATE OR REPLACE FUNCTION public.generate_complete_schema_dump()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    dump_text TEXT := '';
    rec RECORD;
    roles_str TEXT;
BEGIN
    -- 1. Таблицы с их колонками
    FOR rec IN 
        SELECT 
            t.table_name,
            string_agg(
                '    ' || c.column_name || ' ' || 
                c.data_type || 
                CASE 
                    WHEN c.character_maximum_length IS NOT NULL 
                    THEN '(' || c.character_maximum_length || ')'
                    ELSE ''
                END ||
                CASE 
                    WHEN c.is_nullable = 'NO' THEN ' NOT NULL'
                    ELSE ''
                END,
                ',' || E'\n' ORDER BY c.ordinal_position
            ) as columns_def
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c 
            ON t.table_name = c.table_name 
            AND t.table_schema = c.table_schema
        WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_name
        ORDER BY t.table_name
    LOOP
        dump_text := dump_text || 
            '-- Table: ' || rec.table_name || E'\n' ||
            'CREATE TABLE IF NOT EXISTS ' || rec.table_name || ' (' || E'\n' ||
            rec.columns_def || E'\n);' || E'\n\n';
    END LOOP;

    -- 2. Первичные ключи
    FOR rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as pk_columns
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
            AND tc.constraint_type = 'PRIMARY KEY'
        GROUP BY tc.table_name, tc.constraint_name
        ORDER BY tc.table_name
    LOOP
        dump_text := dump_text || 
            '-- Primary Key: ' || rec.constraint_name || E'\n' ||
            'ALTER TABLE ' || rec.table_name || E'\n' ||
            'ADD CONSTRAINT ' || rec.constraint_name || E'\n' ||
            'PRIMARY KEY (' || rec.pk_columns || ');' || E'\n\n';
    END LOOP;

    -- 3. Внешние ключи
    FOR rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as fk_columns,
            ccu.table_name as ref_table,
            string_agg(ccu.column_name, ', ') as ref_columns,
            rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_schema = 'public'
            AND tc.constraint_type = 'FOREIGN KEY'
        GROUP BY tc.table_name, tc.constraint_name, ccu.table_name, rc.delete_rule
        ORDER BY tc.table_name, tc.constraint_name
    LOOP
        dump_text := dump_text || 
            '-- Foreign Key: ' || rec.constraint_name || E'\n' ||
            'ALTER TABLE ' || rec.table_name || E'\n' ||
            'ADD CONSTRAINT ' || rec.constraint_name || E'\n' ||
            'FOREIGN KEY (' || rec.fk_columns || ')' || E'\n' ||
            'REFERENCES ' || rec.ref_table || '(' || rec.ref_columns || ')' ||
            CASE rec.delete_rule
                WHEN 'CASCADE' THEN ' ON DELETE CASCADE'
                WHEN 'SET NULL' THEN ' ON DELETE SET NULL'
                WHEN 'SET DEFAULT' THEN ' ON DELETE SET DEFAULT'
                ELSE ''
            END || ';' || E'\n\n';
    END LOOP;

    -- 4. Индексы (кроме первичных ключей)
    FOR rec IN 
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
            AND indexname NOT LIKE '%_pkey'
        ORDER BY tablename, indexname
    LOOP
        dump_text := dump_text || 
            '-- Index: ' || rec.indexname || E'\n' ||
            rec.indexdef || ';' || E'\n\n';
    END LOOP;

    -- 5. Функции
    FOR rec IN 
        SELECT 
            p.proname,
            pg_get_function_arguments(p.oid) as arguments,
            pg_get_function_result(p.oid) as returns,
            l.lanname as language,
            CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security,
            CASE p.provolatile 
                WHEN 'i' THEN 'IMMUTABLE'
                WHEN 's' THEN 'STABLE'
                ELSE 'VOLATILE'
            END as volatility,
            CASE WHEN p.proisstrict THEN 'STRICT' ELSE '' END as strictness,
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = 'public'
            AND p.proname NOT LIKE 'pg_%'
        ORDER BY p.proname
    LOOP
        dump_text := dump_text || 
            '-- Function: ' || rec.proname || E'\n' ||
            'CREATE OR REPLACE FUNCTION ' || rec.proname || '(' || rec.arguments || ')' || E'\n' ||
            'RETURNS ' || rec.returns || E'\n' ||
            'LANGUAGE ' || rec.language || E'\n' ||
            rec.security || E'\n' ||
            rec.volatility || E'\n' ||
            CASE WHEN rec.strictness != '' THEN rec.strictness || E'\n' ELSE '' END ||
            'AS $BODY$' || E'\n' ||
            rec.definition || E'\n' ||
            '$BODY$;' || E'\n\n';
    END LOOP;

    -- 6. Триггеры
    FOR rec IN 
        SELECT 
            t.tgname as trigger_name,
            c.relname as table_name,
            CASE WHEN (t.tgtype::integer & 2) = 2 THEN 'BEFORE' ELSE 'AFTER' END as timing,
            CASE 
                WHEN (t.tgtype::integer & 4) = 4 THEN 'INSERT'
                WHEN (t.tgtype::integer & 8) = 8 THEN 'DELETE'
                WHEN (t.tgtype::integer & 16) = 16 THEN 'UPDATE'
                ELSE 'UNKNOWN'
            END as event,
            CASE WHEN (t.tgtype::integer & 1) = 1 THEN 'ROW' ELSE 'STATEMENT' END as granularity,
            p.proname as function_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
            AND NOT t.tgisinternal
        ORDER BY c.relname, t.tgname
    LOOP
        dump_text := dump_text || 
            '-- Trigger: ' || rec.trigger_name || E'\n' ||
            'CREATE TRIGGER ' || rec.trigger_name || E'\n' ||
            '    ' || rec.timing || ' ' || rec.event || E'\n' ||
            '    ON ' || rec.table_name || E'\n' ||
            '    FOR EACH ' || rec.granularity || E'\n' ||
            '    EXECUTE FUNCTION ' || rec.function_name || '();' || E'\n\n';
    END LOOP;

    -- 7. RLS политики (обработка массива ролей)
    FOR rec IN 
        SELECT 
            policyname,
            tablename,
            permissive,
            cmd,
            roles,
            qual,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        -- Конвертируем массив ролей в строку
        IF rec.roles IS NOT NULL THEN
            SELECT string_agg(quote_ident(role), ', ') INTO roles_str
            FROM unnest(rec.roles) as role;
        ELSE
            roles_str := 'public';
        END IF;
        
        dump_text := dump_text || 
            '-- Policy: ' || rec.policyname || E'\n' ||
            'CREATE POLICY ' || rec.policyname || E'\n' ||
            '    ON ' || rec.tablename || E'\n' ||
            '    AS ' || rec.permissive || E'\n' ||
            '    FOR ' || rec.cmd || E'\n' ||
            '    TO ' || roles_str || E'\n' ||
            CASE WHEN rec.qual IS NOT NULL AND rec.qual != '' THEN '    USING (' || rec.qual || ')' || E'\n' ELSE '' END ||
            CASE WHEN rec.with_check IS NOT NULL AND rec.with_check != '' THEN '    WITH CHECK (' || rec.with_check || ')' || E'\n' ELSE '' END ||
            ';' || E'\n\n';
    END LOOP;

    -- 8. Последовательности (исправлено - cache вместо cache_value)
    FOR rec IN 
        SELECT 
            sequence_name,
            start_value,
            minimum_value,
            maximum_value,
            increment
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        ORDER BY sequence_name
    LOOP
        dump_text := dump_text || 
            '-- Sequence: ' || rec.sequence_name || E'\n' ||
            'CREATE SEQUENCE IF NOT EXISTS ' || rec.sequence_name || E'\n' ||
            '    START WITH ' || rec.start_value || E'\n' ||
            '    INCREMENT BY ' || rec.increment || E'\n' ||
            '    MINVALUE ' || rec.minimum_value || E'\n' ||
            '    MAXVALUE ' || rec.maximum_value || E'\n' ||
            '    CACHE 1;' || E'\n\n';
    END LOOP;

    -- 9. Представления
    FOR rec IN 
        SELECT 
            table_name,
            view_definition
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        dump_text := dump_text || 
            '-- View: ' || rec.table_name || E'\n' ||
            'CREATE OR REPLACE VIEW ' || rec.table_name || ' AS' || E'\n' ||
            rec.view_definition || ';' || E'\n\n';
    END LOOP;

    RETURN dump_text;
END;
$function$

$BODY$;

-- Function: handle_new_auth_user
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
AS $BODY$
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Вставляем пользователя в public.users с email в display_name
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email,  -- Заполняем display_name email'ом
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(users.display_name, EXCLUDED.email),
      updated_at = EXCLUDED.updated_at;
  
  -- Вставляем пользователя в public.userdata
  INSERT INTO public.userdata (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$function$

$BODY$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
VOLATILE
AS $BODY$
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$

$BODY$;

-- Trigger: update_nodes_updated_at
CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE
    ON nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: update_template_nodes_updated_at
CREATE TRIGGER update_template_nodes_updated_at
    BEFORE UPDATE
    ON template_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: update_templates_updated_at
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE
    ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: update_userdata_updated_at
CREATE TRIGGER update_userdata_updated_at
    BEFORE UPDATE
    ON userdata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: update_users_updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Policy: Users can delete own dependencies
CREATE POLICY Users can delete own dependencies
    ON dependencies
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can insert own dependencies
CREATE POLICY Users can insert own dependencies
    ON dependencies
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = user_id))
;

-- Policy: Users can view own dependencies
CREATE POLICY Users can view own dependencies
    ON dependencies
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can delete own nodes
CREATE POLICY Users can delete own nodes
    ON nodes
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can insert own nodes
CREATE POLICY Users can insert own nodes
    ON nodes
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = user_id))
;

-- Policy: Users can update own nodes
CREATE POLICY Users can update own nodes
    ON nodes
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can view own nodes
CREATE POLICY Users can view own nodes
    ON nodes
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Anyone can view public template dependencies
CREATE POLICY Anyone can view public template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.access = true)))))
;

-- Policy: Template owners can insert template dependencies
CREATE POLICY Template owners can insert template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Template owners can view their template dependencies
CREATE POLICY Template owners can view their template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can delete template dependencies
CREATE POLICY Users can delete template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can insert template dependencies
CREATE POLICY Users can insert template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can view template dependencies
CREATE POLICY Users can view template dependencies
    ON template_dependencies
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_dependencies.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Anyone can view public template nodes
CREATE POLICY Anyone can view public template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.access = true)))))
;

-- Policy: Template owners can view their template nodes
CREATE POLICY Template owners can view their template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can delete template nodes
CREATE POLICY Users can delete template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can insert template nodes
CREATE POLICY Users can insert template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can update template nodes
CREATE POLICY Users can update template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Users can view template nodes
CREATE POLICY Users can view template nodes
    ON template_nodes
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
   FROM templates
  WHERE ((templates.id = template_nodes.template_id) AND (templates.user_id = auth.uid())))))
;

-- Policy: Anyone can view public templates
CREATE POLICY Anyone can view public templates
    ON templates
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((access = true))
;

-- Policy: Users can delete own templates
CREATE POLICY Users can delete own templates
    ON templates
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can insert own templates
CREATE POLICY Users can insert own templates
    ON templates
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = user_id))
;

-- Policy: Users can update own templates
CREATE POLICY Users can update own templates
    ON templates
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can view own templates
CREATE POLICY Users can view own templates
    ON templates
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can insert own tours
CREATE POLICY Users can insert own tours
    ON user_tours
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = user_id))
;

-- Policy: Users can update own tours
CREATE POLICY Users can update own tours
    ON user_tours
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can view own tours
CREATE POLICY Users can view own tours
    ON user_tours
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = user_id))
;

-- Policy: Users can insert own userdata
CREATE POLICY Users can insert own userdata
    ON userdata
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = id))
;

-- Policy: Users can update own userdata
CREATE POLICY Users can update own userdata
    ON userdata
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = id))
;

-- Policy: Users can view own userdata
CREATE POLICY Users can view own userdata
    ON userdata
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = id))
;

-- Policy: Users can insert own profile
CREATE POLICY Users can insert own profile
    ON users
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = id))
;

-- Policy: Users can update own profile
CREATE POLICY Users can update own profile
    ON users
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = id))
;

-- Policy: Users can view own profile
CREATE POLICY Users can view own profile
    ON users
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((auth.uid() = id))
;