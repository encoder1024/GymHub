import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MercadoPagoConfig, Payment } from "https://esm.sh/mercadopago@2.1.0";

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Solo procesamos si es el webhook
  if (action !== "webhook") {
    return new Response("Not a webhook", { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get("MP_ACCESS_TOKEN") || "",
    });

    const body = await req.json();

    // Mercado Pago envía notificaciones por varios eventos.
    // Solo nos interesa cuando un pago fue creado o actualizado.
    if (body.type === "payment") {
      const paymentId = body.data.id;

      // Consultamos directo a la API
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`,
          },
        },
      );

      const mpPayment = await mpResponse.json();
      const orderId = mpPayment.external_reference;

      // ... dentro de la lógica donde confirmas el pago ...

      if (mpPayment.status === "approved") {
        // 1. Obtener los detalles de la orden para saber qué plan compró
        const { data: order } = await supabase
          .from("orders")
          .select("*, user_id")
          .eq("id", orderId)
          .single();

        // 2. Calcular la fecha de vencimiento según el plan
        // Asumimos que guardas la duración en tu tabla de planes o la defines aquí
        let daysToAdd = 30;
        if (order.plan_name === "Trimestral") daysToAdd = 90;
        if (order.plan_name === "Anual") daysToAdd = 365;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysToAdd);

        // 3. Crear la membresía (y gracias al UNIQUE de SQL, esto no se duplicará)
        const { error: membershipError } = await supabase
          .from("owner_memberships")
          .insert([
            {
              user_id: order.user_id,
              order_id: orderId,
              membership_type_id: order.plan_name,
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              status: "active",
            },
          ]);

        if (membershipError)
          console.error("Error activando membresía:", membershipError);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(error.message, { status: 500 });
  }
});
