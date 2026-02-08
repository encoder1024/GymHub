// import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importar useNavigate
// import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth'; // Para verificar la sesión

const MembershipPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  // Datos de ejemplo para los planes de membresía (idealmente, estos vendrían de la DB)
  const membershipPlans = [
    { id: 1, name: 'Mensual', price: 50000, duration_days: 1, description: 'Acceso ilimitado por 30 días.' },
    { id: 2, name: 'Trimestral', price: 140000, duration_days: 90, description: 'Membresía válida por 90 días.' },
    { id: 3, name: 'Anual', price: 540000, duration_days: 365, description: 'Ahorra al elegir nuestra membresía anual.' },
  ];

  const handleSelectPlan = (plan) => {
    if (!session?.user) {
      // Si no hay sesión, redirigir a login con el plan seleccionado para que se pueda volver
      navigate('/login', { state: { redirectTo: '/checkout', planDetails: plan } });
    } else {
      // Si hay sesión, navegar directamente a checkout con los detalles del plan
      navigate('/checkout', { state: { plan: plan } });
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Elige tu Plan de Membresía</h1>
      <div className="flex flex-wrap justify-center items-center">
        {membershipPlans.map(plan => (
          <div key={plan.id} className="bg-white shadow-1 br3 pa4 ma3 measure w-100 w-40-m w-30-l tc flex flex-column justify-between">
            <h2 className="f3 mb2">{plan.name}</h2>
            <p className="f1 mv3">${plan.price.toFixed(0)}</p>
            <p className="f5 lh-copy mb4">{plan.description}</p>
            <button
              onClick={() => handleSelectPlan(plan)}
              className="bn ph4 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib br2 link dim black mt-auto" // mt-auto para empujar el botón al final
            >
              Seleccionar Plan
            </button>
          </div>
        ))}
      </div>
      {/* Opcional: Sección para ver gimnasios afiliados */}
      <div className="mt5 tc">
        <h2 className="f3 mb4">Acceso a Gimnasios Afiliados</h2>
        <p className="lh-copy measure center">Con tu membresía, podrás acceder a la red de gimnasios asociados.</p>
        <div className="flex flex-wrap justify-center mt3">
           <Link to="/gyms" className="bn ph4 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib br2 link dim black">
             Ver Gimnasios
           </Link>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
