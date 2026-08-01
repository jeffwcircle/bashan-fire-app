import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      first_name,
      last_name,
      role,
      active,
      is_firefighter,
    } = body;

    // Create Authentication user
    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: data.user.id,
          first_name,
          last_name,
          role,
          active,
          is_firefighter,
        });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    // Create firefighter status row (only if applicable)
    if (is_firefighter) {
      const { error: statusError } =
        await supabaseAdmin
          .from("firefighter_status")
          .insert({
            user_id: data.user.id,
            status: "No Status",
          });

      if (statusError) {
        console.error(statusError);
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}