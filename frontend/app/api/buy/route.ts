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
      customer_id,
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

    // Fetch product to get the price and download_url (for digital)
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

    // Create the order
    const { data: order, error: orderError } = await supabase
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
        customer_id: customer_id || null,
      })
      .select("id")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      );
    }

    // Insert into order_items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: product_id,
        quantity: 1,
        price: subtotal,
      });

    if (itemsError) {
      // If order_items insert fails, delete the order to keep data consistent
      await supabase.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { error: itemsError.message },
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

