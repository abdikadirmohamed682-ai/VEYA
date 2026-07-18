import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const validStatuses = new Set(["pending", "processing", "completed", "cancelled"]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== "string" || !validStatuses.has(status)) {
      return NextResponse.json({ error: "A valid order status is required." }, { status: 400 });
    }

    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authorization } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: "Store not found." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .eq("store_id", store.id)
      .select("id, status")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to update order status." }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
