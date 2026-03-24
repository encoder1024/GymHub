// /supabase/functions/notify-gym-event-new-book/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONE_SIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONE_SIGNAL_API_KEY = Deno.env.get("ONESIGNAL_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

serve(async (req) => {
  try {
    const body = await req.json();
    const booking_id = body?.record?.id;

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: "El webhook no envió record.id" }),
        { status: 400 },
      );
    }

    const { data: booking } = await supabase
      .from("bookings_santa_fe")
      .select("user_id, class_id")
      .eq("id", booking_id)
      .single();

    if (!booking) {
      return new Response(JSON.stringify({ error: "Reserva no encontrada" }), {
        status: 404,
      });
    }

    const { user_id, class_id } = booking;

    const { data: classData } = await supabase
      .from("classes_santa_fe")
      .select("gym_id, name, start_time")
      .eq("id", class_id)
      .single();

    if (!classData) {
      return new Response(JSON.stringify({ error: "Clase no encontrada" }), {
        status: 404,
      });
    }

    const { gym_id, name, start_time } = classData;

    const { data: gym } = await supabase
      .from("gymsSantaFe")
      .select("owner_id")
      .eq("id", gym_id)
      .single();

    if (!gym) {
      return new Response(JSON.stringify({ error: "Gimnasio no encontrado" }), {
        status: 404,
      });
    }

    const { owner_id } = gym;

    const toArgentinaDate = (utcString: string) => {
      const date = new Date(utcString);

      return new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(date);
    };

    const toArgentinaTime = (utcString: string) => {
      const date = new Date(utcString);

      return new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    };

    const fechaLocal = toArgentinaDate(classData.start_time);
    const horaLocal = toArgentinaTime(classData.start_time);

    const payloadOwner = {
      app_id: ONE_SIGNAL_APP_ID,
      include_aliases: {},
      headings: { en: "Nueva reserva en tu gimnasio" },
      contents: {
        en: `Un cliente reservó la clase "${name}".\nFecha: ${fechaLocal}\nHora: ${horaLocal}`,
      },
      url: `https://tugym.com/owner/reservas/${booking_id}`,
      target_channel: "push",
      channel_for_external_user_ids: "push",
    };

    const payloadUser = {
      app_id: ONE_SIGNAL_APP_ID,
      include_aliases: {},
      headings: { en: "Reserva confirmada" },
      contents: {
        en: `Te inscribiste en la clase "${name}".\nFecha: ${fechaLocal}\nHora: ${horaLocal}`,
      },
      url: `https://tugym.com/app/mis-clases/${booking_id}`,
      target_channel: "push",
      channel_for_external_user_ids: "push",
    };

    const sendToAlias = async (alias: string, basePayload: any) => {
      const finalPayload = {
        ...basePayload,
        include_aliases: { external_id: [alias] },
      };

      const res = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
        },
        body: JSON.stringify(finalPayload),
      });

      return { response: await res.json(), sentPayload: finalPayload };
    };

    const ownerResult = await sendToAlias(owner_id, payloadOwner);

    await supabase.from("notifications_log").insert({
      booking_id,
      target_user: owner_id,
      target_role: "owner",
      payload: ownerResult.sentPayload,
      onesignal_response: ownerResult.response,
      status: ownerResult.response.errors ? "error" : "success",
    });

    const userResult = await sendToAlias(user_id, payloadUser);

    await supabase.from("notifications_log").insert({
      booking_id,
      target_user: user_id,
      target_role: "user",
      payload: userResult.sentPayload,
      onesignal_response: userResult.response,
      status: userResult.response.errors ? "error" : "success",
    });

    return new Response(
      JSON.stringify({
        status: "ok",
        owner_notification: ownerResult.response,
        user_notification: userResult.response,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
