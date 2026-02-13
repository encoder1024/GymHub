import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';

export const MpFailurePayment = () => (
  <div className="min-vh-100 bg-near-white flex flex-column items-center justify-center ph3">
    <div className="bg-gray mw6 w-100 pa4 pa5-ns br3 shadow-5 tc">
      <XCircle size={64} className="red mb3" />
      <h1 className="f2 withe mb2">Pago Rechazado</h1>
      <p className="f5 withe mb4">No pudimos procesar tu transacción. No se ha realizado ningún cargo.</p>
      
      <div className="bg-washed-red pa3 br2 mb4 tl">
        <h4 className="f6 dark-red mb2 mt0 uppercase">Posibles motivos:</h4>
        <ul className="f6 dark-gray pl3 lh-copy">
          <li>Fondos insuficientes o límite de tarjeta excedido.</li>
          <li>La entidad emisora bloqueó el pago por seguridad.</li>
          <li>Datos de la tarjeta ingresados incorrectamente.</li>
        </ul>
      </div>

      <div className="flex flex-column gap-2">
        <Link to="/admin/memberships" className="bg-red white pv3 ph4 br2 b bn dim ttu tracked f6 dib w-100 no-underline mb2">
          Reintentar Pago <RefreshCw size={16} className="ml2" />
        </Link>
        <a href="https://wa.me/543513854913" className="dark-gray pv3 ph4 br2 b ba b--light-gray dim ttu tracked f6 dib w-100 no-underline">
          <MessageCircle size={16} className="mr2" /> Contactar Soporte
        </a>
      </div>
    </div>
  </div>
);