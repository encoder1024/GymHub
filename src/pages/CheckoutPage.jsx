import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const { session } = useAuth();
  const location = useLocation(); // Para obtener el plan seleccionado si se pasa por state
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si se navegó desde MembershipPage, el plan debería estar en location.state
    if (location.state?.plan) {
      setSelectedPlan(location.state.plan);
    } else {
      // Si no se recibe un plan, redirigir a la página de membresías
      // O mostrar un error indicando que debe seleccionar un plan primero
      setError("Por favor, selecciona un plan de membresía desde la página de planes.");
      // Podríamos redirigir después de un tiempo o al usuario hacer clic en un botón
      // navigate('/membership'); 
    }
  }, [location, navigate]); // Dependencias

  const handleCheckout = async () => {
    if (!session?.user) {
      setError("Debes iniciar sesión para continuar.");
      return;
    }
    if (!selectedPlan) {
      setError("Por favor, selecciona un plan de membresía válido.");
      return;
    }

    setLoading(true);
    setError(null);

    // --- SIMULACIÓN DE LLAMADA A UNA EDGE FUNCTION PARA CREAR PREFERENCIA DE PAGO ---
    // La Edge Function 'create_mercadopago_preference' debería:
    // 1. Recibir user_id, plan_id, price, plan_name.
    // 2. Crear una orden temporal en nuestra DB (opcional, para seguimiento).
    // 3. Crear una preferencia de pago en Mercadopago usando su SDK.
    // 4. Retornar el checkout URL de Mercadopago.
    
    const userId = session.user.id;
    const planId = selectedPlan.id;
    const price = selectedPlan.price;
    const planName = selectedPlan.name;

    try {
      // Asumiendo que la función RPC se llama 'create_mercadopago_preference'
      // y espera los parámetros p_user_id, p_plan_id, p_price, p_plan_name
      const { data, error: rpcError } = await supabase.rpc('create_mercadopago_preference', {
        p_user_id: userId,
        p_plan_id: planId,
        p_price: price,
        p_plan_name: planName
      });

      if (rpcError) throw rpcError;

      // La función RPC debería retornar el checkout URL de Mercadopago
      const checkoutUrl = data?.checkout_url; // Acceder de forma segura si data es null
      if (checkoutUrl) {
        // Redirige al usuario a la página de pago de Mercadopago
        window.location.href = checkoutUrl; 
      } else {
        throw new Error("No se pudo obtener la URL de pago de Mercadopago. Por favor, intenta de nuevo más tarde.");
      }

    } catch (error) {
      console.error("Error during checkout:", error);
      setError(`Error al iniciar el pago: ${error.message}`);
      setLoading(false);
    }
    // Nota: El setLoading(false) idealmente se manejaría en el webhook,
    // pero aquí, si falla la redirección, se detiene.
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Resumen de tu Pedido</h1>
      <div className="measure center pa4 bg-white shadow-1 br2">
        {error && <p className="f6 red tc mb3">{error}</p>}
        
        {!error && selectedPlan && session?.user ? (
          <>
            <h2 className="f3 tc mb2">{selectedPlan.name}</h2>
            <p className="f1 tc mv3">${selectedPlan.price.toFixed(2)}</p>
            <p className="f5 lh-copy tc mb4">{selectedPlan.description}</p>
            <div className="tc">
              <p className="mb3 f6 gray">
                Procesando para el usuario: <strong>{session.user.email}</strong>
              </p>
              <button
                onClick={handleCheckout}
                disabled={loading || !selectedPlan || !session?.user}
                className="bn ph4 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white b"
              >
                {loading ? 'Procesando...' : 'Ir a Pagar con Mercadopago'}
              </button>
            </div>
          </>
        ) : !error && !session?.user ? (
          <p className="tc f6 red">
            Debes <Link to="/login" className="link dim blue db">iniciar sesión</Link> para continuar.
          </p>
        ) : !error && !selectedPlan ? (
          <p className="tc">No se ha seleccionado un plan. Por favor, regresa a la página de membresías para elegir uno.</p>
        ) : null} {/* null si no hay error, ni plan, ni sesión */}
      </div>
    </div>
  );
};

export default CheckoutPage;