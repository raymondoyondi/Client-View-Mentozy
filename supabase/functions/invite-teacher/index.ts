import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    console.log("Invite-Teacher function was hit! Request Method:", req.method);

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const bodyContent = await req.json();
        console.log("Received body:", bodyContent);
        
        const { email, name, phone } = bodyContent;

        if (!email) {
            console.error("No email provided in body");
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
        
        // IMPORTANT: We ABSOLUTELY CANNOT use the "anon" key you provided to invite users. 
        // Inviting users is an "Admin Only" action.
        // Thankfully, Supabase Edge Functions automatically provide the secret Service Role key!
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!serviceRoleKey) {
            console.error("Missing Service Role Key!");
            throw new Error("Missing Supabase Service Role Key.");
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        console.log(`Sending invite email to ${email}...`);
        
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: name || '',
                phone_number: phone || '',
                role: 'mentor', // Must be 'mentor', 'student', or 'admin' based on DB constraints!
                is_org: false,
                is_teacher: true
            }
        });

        if (error) {
            console.error("Supabase Admin Error:", error);
            throw error;
        }

        console.log("Invite sent successfully!", data.user?.id);

        return new Response(JSON.stringify({ message: "Invite sent successfully!", user: data.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Caught Exception:", error.message, error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
