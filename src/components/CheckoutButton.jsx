import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// REEMPLAZA con tu Public Key de TEST
initMercadoPago('APP_USR-41dbd84c-6ba7-416f-9c46-7f17d149eee1');

const CheckoutButton = ({ preferenceId }) => {
  return (
    <div id="wallet_container" className="thy-w-full">
      <Wallet 
        initialization={{ preferenceId: preferenceId }} 
        customization={{ texts: { valueProp: 'smart_option' } }}
      />
    </div>
  );
};

export default CheckoutButton;