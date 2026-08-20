import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Customer authentication is required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authorization } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Customer authentication is required" }, { status: 401 });
    }

    const procedure = body.cart_checkout ? "create_customer_cart_order" : "create_customer_order";
    const parameters = body.cart_checkout
      ? {
          p_customer_name: body.customer_name,
          p_phone: body.phone,
          p_whatsapp: body.whatsapp,
          // Ensure we always pass a string for address (empty string when
          // missing) so the DB function can validate required fields and we
          // avoid inserting SQL NULL into a NOT NULL column.
          p_address: body.address ?? "",
          p_notes: body.notes ?? null,
          p_sender_payment_number: body.sender_payment_number,
        }
      : {
      p_product_id: body.product_id,
      p_store_id: body.store_id,
      p_customer_name: body.customer_name,
      p_phone: body.phone,
      p_whatsapp: body.whatsapp,
      p_address: body.address ?? "",
      p_notes: body.notes ?? null,
      p_sender_payment_number: body.sender_payment_number,
        };
    const { data: orderId, error } = await supabase.rpc(procedure, parameters);

    if (error) {
      const e = error as unknown as {
        message: string;
        code?: string | number | null;
        details?: string | null;
        hint?: string | null;
      };
      const errObj = {
        message: e.message,
        code: e.code ?? null,
        details: e.details ?? null,
        hint: e.hint ?? null,
      };
      return NextResponse.json({ error: errObj }, { status: 400 });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
