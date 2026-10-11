
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Verify the signed-in administrator.
    const authorization = req.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      console.error("Missing Supabase environment variables.");

      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user: requester },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !requester) {
      return NextResponse.json(
        { error: "Your session is invalid or expired." },
        { status: 401 }
      );
    }

    // Load the requester's profile.
    const { data: requesterProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("role_id, active")
        .eq("id", requester.id)
        .maybeSingle();

    if (profileError) {
      console.error("Administrator profile lookup failed:", profileError);

      return NextResponse.json(
        { error: "Unable to verify your permissions." },
        { status: 500 }
      );
    }

    if (
      !requesterProfile ||
      requesterProfile.active === false ||
      !requesterProfile.role_id
    ) {
      return NextResponse.json(
        { error: "You are not authorized to change passwords." },
        { status: 403 }
      );
    }

    // Verify the members permission server-side.
    const { data: rolePermissions, error: rolePermissionError } =
      await supabaseAdmin
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", requesterProfile.role_id);

    if (rolePermissionError) {
      console.error("Role permission lookup failed:", rolePermissionError);

      return NextResponse.json(
        { error: "Unable to verify your permissions." },
        { status: 500 }
      );
    }

    const permissionIds =
      rolePermissions?.map((item) => item.permission_id) ?? [];

    if (permissionIds.length === 0) {
      return NextResponse.json(
        { error: "You do not have permission to change passwords." },
        { status: 403 }
      );
    }

    const { data: permissionRows, error: permissionError } =
      await supabaseAdmin
        .from("permissions")
        .select("key")
        .in("id", permissionIds);

    if (permissionError) {
      console.error("Permission lookup failed:", permissionError);

      return NextResponse.json(
        { error: "Unable to verify your permissions." },
        { status: 500 }
      );
    }

    const allowed = permissionRows?.some(
      (permission) => permission.key === "members"
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "You do not have permission to change passwords." },
        { status: 403 }
      );
    }

    // Validate the requested account and new password.
    const body = await req.json();
    const { userId, password } = body;

    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      return NextResponse.json(
        { error: "Invalid member account." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must be 128 characters or fewer." },
        { status: 400 }
      );
    }

    // Confirm that the target account has a profile.
    const { data: targetProfile, error: targetError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (targetError) {
      console.error("Target member lookup failed:", targetError);

      return NextResponse.json(
        { error: "Unable to find the member account." },
        { status: 500 }
      );
    }

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Member account not found." },
        { status: 404 }
      );
    }

    // Change the password in Supabase Auth, not in profiles.
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });

    if (updateError) {
      console.error("Password update failed:", updateError);

      return NextResponse.json(
        { error: "Unable to update the password." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update password API error:", err);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
