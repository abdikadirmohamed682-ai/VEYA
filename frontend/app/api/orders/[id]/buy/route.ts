import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      product_id,
      store_id,
      customer_name,
      phone,
      whatsapp,
      address,
      notes,
      sender_payment_number,
    } = body;

    if (
      !product_id ||
      !store_id ||
      !customer_name ||
      !phone ||
      !whatsapp ||
      !sender_payment_number
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch store type to determine if address is required
    const { data: storeRow } = await supabase
      .from("stores")
      .select("store_type")
      .eq("id", store_id)
      .single();

    const storeType = storeRow?.store_type;

    if (storeType !== "digital" && !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("price, download_url")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const subtotal = Number(product.price);
    const delivery_fee = 0;
    const total = subtotal + delivery_fee;

    // Determine download_url for digital orders
    const download_url = storeType === "digital" ? (product.download_url ?? null) : null;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        product_id,
        store_id,
        customer_name,
        phone,
        whatsapp,
        address,
        notes,
        subtotal,
        delivery_fee,
        total,
        status: "pending",
        payment_status: "waiting",
        sender_payment_number,
        download_url,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
