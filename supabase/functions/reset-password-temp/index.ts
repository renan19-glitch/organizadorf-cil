import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // CORREÇÃO: Usando a função RPC 'get_user_by_email' para encontrar o usuário de forma segura
    const { data: foundUsers, error: rpcError } = await supabaseAdmin
        .rpc('get_user_by_email', { p_email: email });

    if (rpcError) {
        console.error('Erro ao chamar RPC get_user_by_email:', rpcError);
        throw new Error('Failed to search for user via RPC.');
    }

    const user = foundUsers && foundUsers.length > 0 ? foundUsers[0] : null;

    if (!user) {
      // Por segurança, não informamos se o usuário não existe.
      console.log(`Tentativa de reset para e-mail não encontrado: ${email}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newPassword = 'pague123'; // Senha fixa

    // Atualizar a senha do usuário
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error(`Erro ao atualizar senha para o usuário ${user.id}:`, updateError);
      throw updateError;
    }

    console.log(`Senha para ${email} redefinida para 'pague123'.`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro geral no processamento da redefinição de senha:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});