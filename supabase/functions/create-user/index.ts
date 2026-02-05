import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authorization header to verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the calling user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !callingUser) {
      console.error('Failed to get calling user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if calling user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'staff')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('User is not staff:', roleError);
      return new Response(
        JSON.stringify({ error: 'Only staff can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, name, role, userType, recordId } = await req.json();

    console.log('Creating user with email:', email, 'role:', role, 'userType:', userType);

    // Validate required fields
    if (!email || !password || !role || !userType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, role, userType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['staff', 'parent', 'student'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the auth user using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: name || email.split('@')[0],
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = authData.user.id;
    console.log('Auth user created with ID:', newUserId);

    // The trigger will create the profile and default parent role
    // But we need to update the role if it's not parent
    if (role !== 'parent') {
      // Update the role to the correct one
      const { error: updateRoleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role })
        .eq('user_id', newUserId);

      if (updateRoleError) {
        console.error('Error updating role:', updateRoleError);
        // Don't fail the whole operation, the user is created
      }
    }

    // Link the user to the staff or student record
    if (userType === 'staff' && recordId) {
      const { error: staffUpdateError } = await supabaseAdmin
        .from('staff')
        .update({ user_id: newUserId })
        .eq('id', recordId);

      if (staffUpdateError) {
        console.error('Error linking user to staff record:', staffUpdateError);
      }
    } else if (userType === 'student' && recordId) {
      const { error: studentUpdateError } = await supabaseAdmin
        .from('students')
        .update({ user_id: newUserId })
        .eq('id', recordId);

      if (studentUpdateError) {
        console.error('Error linking user to student record:', studentUpdateError);
      }
    }

    console.log('User created successfully:', newUserId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId,
        message: 'User created successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-user function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
