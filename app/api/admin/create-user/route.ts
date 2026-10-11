
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let createdUserId: string | null = null;
  let profileCreated = false;

  try {
    // 1. Verify the signed-in user's access token.
    const authorization = req.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Please sign in before creating a member." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      console.error("Missing Supabase URL or anon key.");

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
        {
          error:
            "Your session is invalid or expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // 2. Load the requester's profile.
    const { data: requesterProfile, error: profileLookupError } =
      await supabaseAdmin
        .from("profiles")
        .select("role_id, active")
        .eq("id", requester.id)
        .maybeSingle();

    if (profileLookupError) {
      console.error(
        "Requester profile lookup failed:",
        profileLookupError
      );

      return NextResponse.json(
        { error: "Unable to verify account permissions." },
        { status: 500 }
      );
    }

    if (
      !requesterProfile ||
      requesterProfile.active === false ||
      !requesterProfile.role_id
    ) {
      return NextResponse.json(
        {
          error:
            "Your account is not authorized to create members.",
        },
        { status: 403 }
      );
    }

    // 3. Load the permissions assigned to the requester's role.
    const { data: rolePermissions, error: rolePermissionError } =
      await supabaseAdmin
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", requesterProfile.role_id);

    if (rolePermissionError) {
      console.error(
        "Role permission lookup failed:",
        rolePermissionError
      );

      return NextResponse.json(
        { error: "Unable to verify account permissions." },
        { status: 500 }
      );
    }

    const permissionIds =
      rolePermissions?.map((item) => item.permission_id) ?? [];

    if (permissionIds.length === 0) {
      return NextResponse.json(
        { error: "You do not have permission to create members." },
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
        { error: "Unable to verify account permissions." },
        { status: 500 }
      );
    }

    const canCreateMembers = permissionRows?.some(
      (permission) => permission.key === "members"
    );

    if (!canCreateMembers) {
      return NextResponse.json(
        { error: "You do not have permission to create members." },
        { status: 403 }
      );
    }

    // 4. Read and validate the new member's information.
    const body = await req.json();

    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      active,
      is_firefighter,
    } = body;

    const normalizedUsername =
      typeof username === "string"
        ? username.trim().toLowerCase()
        : "";

    if (
      !normalizedUsername ||
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 30 ||
      !/^[a-z0-9._-]+$/.test(normalizedUsername)
    ) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–30 characters and contain only letters, numbers, periods, underscores, or hyphens.",
        },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (
      typeof first_name !== "string" ||
      !first_name.trim() ||
      typeof last_name !== "string" ||
      !last_name.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return NextResponse.json(
        { error: "First name, last name, and role are required." },
        { status: 400 }
      );
    }

    if (
      typeof active !== "boolean" ||
      typeof is_firefighter !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid member status values." },
        { status: 400 }
      );
    }

    // 5. Confirm that the selected role exists.
    const { data: selectedRole, error: selectedRoleError } =
      await supabaseAdmin
        .from("roles")
        .select("id, name")
        .eq("name", role.trim())
        .maybeSingle();

    if (selectedRoleError) {
      console.error("Role lookup failed:", selectedRoleError);

      return NextResponse.json(
        { error: "Unable to verify the selected role." },
        { status: 500 }
      );
    }

    if (!selectedRole) {
      return NextResponse.json(
        { error: "The selected role could not be found." },
        { status: 400 }
      );
    }

    // 6. Check username uniqueness.
    const { data: existingUsername, error: usernameLookupError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", normalizedUsername)
        .limit(1)
        .maybeSingle();

    if (usernameLookupError) {
      console.error("Username lookup failed:", usernameLookupError);

      return NextResponse.json(
        { error: "Unable to check username availability." },
        { status: 500 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    // 7. Create the Supabase Auth account.
    const { data: authData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      });

    if (createUserError || !authData.user) {
      return NextResponse.json(
        {
          error:
            createUserError?.message || "Unable to create account.",
        },
        { status: 400 }
      );
    }

    createdUserId = authData.user.id;

    // 8. Create the profile with username and role ID.
    const { error: newProfileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: createdUserId,
        username: normalizedUsername,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: selectedRole.name,
        role_id: selectedRole.id,
        active,
        is_firefighter,
      });

    if (newProfileError) {
      console.error("Profile creation failed:", newProfileError);

      const { error: cleanupError } =
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      if (cleanupError) {
        console.error("Auth account cleanup failed:", cleanupError);
      } else {
        createdUserId = null;
      }

      return NextResponse.json(
        {
          error:
            newProfileError.code === "23505"
              ? "That username is already in use."
              : "The profile could not be saved. Check the server logs.",
        },
        { status: 400 }
      );
    }

    profileCreated = true;

    // 9. Create the initial firefighter status if needed.
    if (is_firefighter) {
      const { error: statusError } = await supabaseAdmin
        .from("firefighter_status")
        .insert({
          user_id: createdUserId,
          status: "No Status",
        });

      if (statusError) {
        console.error(
          "Initial firefighter status creation failed:",
          statusError
        );

        // Keep the account and profile; status creation can be repaired.
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create user API error:", err);

    // Clean up an incomplete account if an unexpected error occurred.
    if (createdUserId && !profileCreated) {
      const { error: cleanupError } =
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      if (cleanupError) {
        console.error("Auth account cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
