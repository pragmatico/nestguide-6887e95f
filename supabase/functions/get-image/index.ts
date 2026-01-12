import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-access-token",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get("path");
    const token = url.searchParams.get("token") || req.headers.get("x-access-token");

    if (!imagePath) {
      return new Response(
        JSON.stringify({ error: "Missing image path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user_id from the image path (format: user_id/filename)
    const userId = imagePath.split("/")[0];

    // Verify the token is valid for a space owned by this user
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select("id")
      .eq("access_token", token)
      .eq("user_id", userId)
      .single();

    if (spaceError || !space) {
      return new Response(
        JSON.stringify({ error: "Invalid token or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a signed URL for the image (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("page-images")
      .createSignedUrl(imagePath, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: signedUrlData.signedUrl }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
