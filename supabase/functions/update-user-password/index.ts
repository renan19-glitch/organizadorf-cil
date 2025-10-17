import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the user from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização ausente. O usuário precisa estar logado.');
    }
    const jwt = authHeader.replace('Bearer ', '');

    // 2. Get the new password from the request body
    const { password } = await req.json();
    if (!password) {
      throw new Error('A nova senha é obrigatória.');
    }

    // 3. Create a Supabase client with the user's JWT to verify their identity
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Falha na verificação do usuário:', userError);
      const errorMessage = userError 
        ? `Falha na verificação da sessão: ${userError.message}` 
        : 'Falha na autenticação: Sessão inválida ou expirada.';
      throw new Error(errorMessage);
    }

    // 4. Create a Supabase admin client to perform the password update
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 5. Update the user's password using their ID
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error('Erro ao atualizar a senha via admin:', updateError);
      throw new Error(`Erro do Supabase: ${updateError.message}`);
    }

    // 6. If successful, return a success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 7. If any error occurs, return a structured error response with a 200 status
    console.error('Erro na Edge Function update-user-password:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    });
  }
});