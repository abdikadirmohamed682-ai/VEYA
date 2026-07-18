import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { customer, items, totals } = body;
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customer.fullName,
          phone_number: customer.phoneNumber,
          whatsapp_number: customer.whatsappNumber,
          delivery_address: customer.deliveryAddress,
          notes: customer.notes,
          subtotal: totals.subtotal,
          delivery_fee: totals.deliveryFee,
          total: totals.grandTotal,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData?.id) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order." }, { status: 500 });
    }

    const orderId = orderData.id;

    const orderItems = items.map((item: OrderItem) => ({
      order_id: orderId,
      product_id: item.product_id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);
    if (orderItemsError) {
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
    }

    for (const item of items) {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.product_id)
        .single();

      if (productError || !productData) {
        continue;
      }

      const newQuantity = Math.max(0, (productData.quantity ?? 0) - item.quantity);
      await supabase.from("products").update({ quantity: newQuantity }).eq("id", item.product_id);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
