import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id, active, is_firefighter } =
      await req.json();

    // Update member profile
    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          active,
        })
        .eq("id", id);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    // Keep firefighter_status synchronized
    if (is_firefighter) {
      const { data: existing, error: statusLookupError } =
        await supabaseAdmin
          .from("firefighter_status")
          .select("id")
          .eq("user_id", id)
          .maybeSingle();

      if (statusLookupError) {
        console.error(statusLookupError);
      }

      if (existing) {
        // Update existing record
        const { error: updateError } =
          await supabaseAdmin
            .from("firefighter_status")
            .update({
              status: active
                ? "No Status"
                : "Inactive",
              updated_at:
                new Date().toISOString(),
            })
            .eq("user_id", id);

        if (updateError) {
          console.error(updateError);
        }
      } else if (active) {
        // Member has never had a firefighter status record.
        // Create one only when activating.
        const { error: insertError } =
          await supabaseAdmin
            .from("firefighter_status")
            .insert({
              user_id: id,
              status: "No Status",
              updated_at:
                new Date().toISOString(),
            });

        if (insertError) {
          console.error(insertError);
        }
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