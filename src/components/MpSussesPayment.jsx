import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const MpSussesPayment = () => {
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const orderId = searchParams.get("external_reference");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrder() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: order, error } = await supabase
        .from("orders")
        .select("*, profiles(full_name)")
        .eq("id", orderId)
        .single();

      // SEGURIDAD: Si la orden no pertenece al usuario logueado, lo sacamos de aquí
      if (order && order.user_id !== user.id) {
        console.error("Acceso no autorizado a los datos de la orden");
        navigate("/admin/membership"); // Redirigir si intenta ver una orden ajena
        return;
      }

      setOrderData(order);
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("*, profiles(full_name)")
        .eq("id", orderId)
        .single();
      setOrderData(data);
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <div className="min-vh-100 bg-near-white flex flex-column items-center justify-center ph3">
      <div className="bg-white mw6 w-100 pa4 pa5-ns br3 shadow-5 tc">
        <CheckCircle size={64} className="green mb3" />
        <h1 className="f2 dark-gray mb2">¡Pago Confirmado!</h1>
        <p className="f5 gray mb4">
          Bienvenido a GymHub, {orderData?.profiles?.full_name || "Socio"}.
        </p>

        <div className="ba b--light-gray br3 pa3 mb4 bg-near-white tl">
          <div className="flex justify-between mb2">
            <span className="f6 b gray uppercase">Plan:</span>
            <span className="f6 dark-gray b">
              {orderData?.plan_name || "Cargando..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="f6 b gray uppercase">ID de Transacción:</span>
            <span className="f6 silver">{searchParams.get("payment_id")}</span>
          </div>
        </div>

        <div className="bg-washed-green pa3 br2 mb4 tl">
          <h4 className="f6 dark-green mb2 mt0 uppercase">Pasos a seguir:</h4>
          <ul className="f6 dark-gray pl3 lh-copy">
            <li>Tu membresía ya se encuentra **activa**.</li>
            <li>Ya puedes crear tu gimnasio y cargar las clases.</li>
            <li>Te llegará a tu email registrado el comprobante del pago.</li>
          </ul>
        </div>

        <Link
          to="/owner/dashboard"
          className="bg-green white pv3 ph4 br2 b bn dim ttu tracked f6 dib w-100 no-underline mb3"
        >
          Ir a mi Dashboard <ArrowRight size={16} className="ml2" />
        </Link>
      </div>
    </div>
  );
};

export default MpSussesPayment;
