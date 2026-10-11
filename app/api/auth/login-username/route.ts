
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Enter your username and password." },
        { status: 400 }
      );
    }

    // Look up the username on the server.
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, active")
        .ilike("username", username)
        .maybeSingle();

    if (profileError) {
      console.error("Username lookup failed:", profileError);
      return NextResponse.json(
        { error: "Unable to sign in right now." },
        { status: 500 }
      );
    }

    // Use a generic error so the endpoint does not reveal account details.
    if (!profile || profile.active === false) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Get the Auth email without returning it to the browser.
    const { data: authData, error: authLookupError } =
      await supabaseAdmin.auth.admin.getUserById(profile.id);

    const email = authData.user?.email;

    if (authLookupError || !email) {
      console.error("Auth user lookup failed:", authLookupError);
      return NextResponse.json(
        { error: "Unable to sign in right now." },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // Verify the password using the public Supabase Auth client.
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.session) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Return only the session tokens needed by the browser.
    return NextResponse.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });
  } catch (error) {
    console.error("Username login error:", error);

    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
