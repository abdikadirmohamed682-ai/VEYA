import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const status = body.status;

    if (
      !status ||
      typeof status !== "string" ||
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      }
    );

    const {
      data: auth,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const {
      data: store,
      error: storeError,
    } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", auth.user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 403 }
      );
    }
        const {
      data: updatedOrder,
      error: updateError,
    } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id)
      .eq("store_id", store.id)
      .select("id, status")
      .maybeSingle();

if (updateError) {
  console.error(updateError);

  return NextResponse.json(
    {
      error: updateError.message || "Failed to update order.",
    },
    { status: 500 }
  );
}

if (!updatedOrder) {
  return NextResponse.json(
    {
      error: "No order was updated.",
      orderId: id,
      storeId: store.id,
    },
    { status: 404 }
  );
}


    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}