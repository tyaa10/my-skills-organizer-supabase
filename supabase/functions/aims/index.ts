import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the latest 10 users with their nodes, ordered by nodes_updated_at
    const { data: users, error } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        userdata!inner(nodes_updated_at),
        nodes!inner(
          title,
          description,
          created_at,
          access,
          status
        )
      `)
      .order('nodes_updated_at', { referencedTable: 'userdata', ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    // Transform the data to match the original Firebase function format
    const usersArray = users?.map(user => {
      const nodesArray = user.nodes
        ?.filter(node => node.access && node.status !== '5' && node.status !== '6')
        ?.map(node => ({
          title: node.title,
          description: node.description,
          createdAt: node.created_at
        })) || []

      const userEmail = user.email || `anonymous_${new Date().toISOString()}`

      return { [userEmail]: nodesArray }
    }) || []

    return new Response(
      JSON.stringify(usersArray),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
