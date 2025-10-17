import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// CORS headers for preflight requests and responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook da Hotmart recebido. Iniciando processamento...');

    // 1. Verify Hotmart Secret Token
    const hotmartToken = req.headers.get('x-hotmart-hottok');
    const expectedToken = Deno.env.get('HOTMART_SECRET_TOKEN');

    if (!hotmartToken || hotmartToken !== expectedToken) {
      console.warn('Falha na autorização: O token "x-hotmart-hottok" é inválido ou está ausente.');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    console.log('Autorização bem-sucedida.');

    // 2. Parse the webhook payload
    const payload = await req.json();
    // --- DEBUG LOG ---
    console.log("DADOS DO PAYLOAD RECEBIDO:", JSON.stringify(payload.data, null, 2));
    
    const { data, event } = payload;
    const userEmail = data?.buyer?.email;
    const userName = data?.buyer?.name;
    const subscriberId = data?.subscription?.subscriber?.code;
    
    // --- Smarter Data Extraction ---
    let subscriptionStatus = data?.subscription?.status?.toLowerCase();
    if (!subscriptionStatus) {
        if (event === 'PURCHASE_APPROVED' || event === 'SUBSCRIPTION_ACTIVATED') {
            subscriptionStatus = 'active';
            console.log(`Status da assinatura inferido como 'active' a partir do evento '${event}'.`);
        }
    }

    const planName = data?.subscription?.plan?.name || data?.purchase?.offer?.name;
    const nextBillingTimestamp = data?.subscription?.date_next_charge;
    let nextBillingDate: string | undefined;

    if (nextBillingTimestamp) {
        // Convert milliseconds timestamp to YYYY-MM-DD date string
        const date = new Date(nextBillingTimestamp);
        nextBillingDate = date.toISOString().split('T')[0];
        console.log(`Data de próxima cobrança convertida do timestamp ${nextBillingTimestamp}: ${nextBillingDate}`);
    }

    if (!userEmail || !userName) {
      console.error('Email ou nome do comprador ausentes no payload:', { userEmail, userName });
      return new Response('Missing buyer email or name', { status: 400, headers: corsHeaders });
    }

    // 3. Create a Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Find or Create User
    let userId: string;

    const { data: foundUsers, error: rpcError } = await supabaseAdmin
        .rpc('get_user_by_email', { p_email: userEmail });

    if (rpcError) {
        console.error('Erro ao chamar RPC get_user_by_email:', rpcError);
        throw new Error('Failed to search for user via RPC.');
    }

    const user = foundUsers && foundUsers.length > 0 ? foundUsers[0] : null;

    if (user) {
        userId = user.id;
        console.log(`Usuário ${userEmail} encontrado com ID: ${userId}`);
    } else {
        console.log(`Usuário ${userEmail} não encontrado. Criando novo usuário...`);
        const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            password: '123pague',
            email_confirm: true,
            user_metadata: { name: userName },
        });

        if (createError) {
            console.error('Erro ao criar usuário:', createError);
            throw new Error('Failed to create user');
        }
        
        userId = newUserData.user.id;
        console.log(`Novo usuário criado com ID: ${userId}`);
    }

    // 6. Build the profile update object CONDITIONALLY
    const profileData: { [key: string]: any } = { id: userId };

    if (subscriptionStatus) profileData.subscription_status = subscriptionStatus;
    if (planName) profileData.plan_name = planName;
    if (nextBillingDate) profileData.next_billing_date = nextBillingDate;
    if (userName) profileData.name = userName;
    if (subscriberId) profileData.subscriber_id = subscriberId;

    if (Object.keys(profileData).length <= 1) {
        console.log('Nenhum dado novo para atualizar no perfil. Encerrando o processamento.');
        return new Response(JSON.stringify({ success: true, message: "No new data to update." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
    }
    
    console.log("Dados que serão atualizados no perfil:", profileData);

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData);

    if (upsertError) {
      console.error('Falha ao atualizar/inserir perfil:', upsertError);
      throw new Error('Failed to upsert profile');
    }

    console.log(`Detalhes da assinatura para ${userEmail} atualizados com sucesso.`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});