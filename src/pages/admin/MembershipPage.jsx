import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";

// Tu Public Key de TEST
initMercadoPago("APP_USR-41dbd84c-6ba7-416f-9c46-7f17d149eee1");

const MembershipPage = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  const membershipPlans = [
    {
      id: 1,
      name: "Mensual",
      price: 50000,
      duration_days: 30,
      description: "Acceso ilimitado por 30 días.",
    },
    {
      id: 2,
      name: "Trimestral",
      price: 135000,
      duration_days: 90,
      description: "Membresía válida por 90 días.",
    },
    {
      id: 3,
      name: "Anual",
      price: 500000,
      duration_days: 365,
      description: "Ahorra al elegir nuestra membresía anual.",
    },
  ];

  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const handleComprar = async (plan) => {
    setIsLoading(true);
    setSelectedPlanId(plan.id); // Guardamos cuál plan se está procesando
    try {
      // PASO 1: Crear la orden en la tabla 'orders'
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            total_amount: plan.price,
            status: "pending",
            customer_name: profile?.full_name || "Consumidor Final",
            customer_doc_type: "99",
            customer_doc_number: "0",
            user_id: session?.user.id,
            plan_name: plan.name
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // PASO 2: Llamar a la Edge Function
      const response = await fetch(
        "https://ougtipazurskmbtasbfl.supabase.co/functions/v1/mercadopago_preference",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            items: [
              {
                id: plan.id.toString(),
                title: plan.name, // Corregido: antes era plan.title
                unit_price: plan.price,
                quantity: 1,
              },
            ],
            // Usamos el email de tu captura de pantalla para el Sandbox
            payerEmail: "TESTUSER3903103485808310964@testuser.com",
          }),
        },
      );

      const data = await response.json();
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
      } else {
        throw new Error("No se recibió preferenceId");
      }
    } catch (error) {
      console.error("Error en el proceso de compra:", error);
      alert("Hubo un error al iniciar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const manejarPerdidaDeFoco = () => {
      // Si el usuario cambia de pestaña o app, limpiamos la preferencia activa.
      // Esto obliga a que al volver tenga que presionar "Comprar" de nuevo.
      if (preferenceId) {
        console.log("Limpiando checkout por cambio de foco...");
        setPreferenceId(null);
        setSelectedPlanId(null);
      }
    };

    // Escuchamos cuando la ventana pierde el foco
    window.addEventListener("blur", manejarPerdidaDeFoco);

    return () => {
      window.removeEventListener("blur", manejarPerdidaDeFoco);
    };
  }, [preferenceId]); // Reacciona cada vez que hay una preferencia activa

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Elige tu Plan de Membresía</h1>

      <div className="flex flex-wrap justify-center items-stretch">
        {membershipPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-gray shadow-1 br3 pa4 ma3 measure w-100 w-40-m w-30-l tc flex flex-column justify-between"
          >
            <div>
              <h2 className="f3 mb2">{plan.name}</h2>
              <p className="f1 mv3">${plan.price.toLocaleString("es-AR")}</p>
              <p className="f5 lh-copy mb4">{plan.description}</p>
            </div>

            <div className="mt-auto w-100 flex flex-column items-center">
              {preferenceId && selectedPlanId === plan.id ? (
                <div className="w-100 flex flex-column items-center animate__animated animate__fadeIn">
                  {/* Llamamos al componente aislado */}
                  <MercadoPagoButton preferenceId={preferenceId} />

                  <button
                    onClick={() => {
                      setPreferenceId(null);
                      setSelectedPlanId(null);
                    }}
                    className="f7 gray pointer bn bg-transparent underline mt2 db"
                  >
                    Elegir otro plan
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleComprar(plan)}
                  disabled={isLoading}
                  className={`bn ph4 pv2 input-reset ba b--black bg-green grow pointer f6 dib br2 white w-100 ${isLoading ? "o-50" : ""}`}
                >
                  {isLoading && selectedPlanId === plan.id
                    ? "Procesando..."
                    : "Comprar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MercadoPagoButton = ({ preferenceId }) => {
  return (
    // La clave es el key único. Si el preferenceId cambia,
    // React descarta este DIV entero y pone uno nuevo,
    // evitando que el SDK de MP intente reusar nodos viejos.
    <div
      key={preferenceId}
      className="w-100 flex justify-center"
      style={{ minHeight: "50px" }}
    >
      <Wallet initialization={{ preferenceId, redirectMode: "modal" }} />
    </div>
  );
};

export default MembershipPage;
