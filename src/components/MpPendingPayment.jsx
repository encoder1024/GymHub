import { Clock, Info } from 'lucide-react';

export const MpPendingPayment = () => (
  <div className="min-vh-100 bg-near-white flex flex-column items-center justify-center ph3">
    <div className="bg-white mw6 w-100 pa4 pa5-ns br3 shadow-5 tc">
      <Clock size={64} className="gold mb3" />
      <h1 className="f2 dark-gray mb2">Pago en Proceso</h1>
      <p className="f5 gray mb4">Estamos esperando la confirmación de tu banco o entidad de pago.</p>
      
      <div className="ba b--light-silver br3 pa3 mb4 bg-washed-yellow tl flex items-start">
        <Info size={24} className="orange mr3 flex-shrink-0" />
        <div className="f6 lh-copy orange">
          <p className="mt0 b">Importante:</p>
          Si pagaste en efectivo, puede demorar hasta 24hs hábiles en acreditarse. Tu membresía se activará automáticamente apenas recibamos el aviso.
        </div>
      </div>

      <Link to="/owner/gym-owner-dashboard" className="bg-gold white pv3 ph4 br2 b bn dim ttu tracked f6 dib w-100 no-underline">
        Entendido, volver al inicio
      </Link>
    </div>
  </div>
);