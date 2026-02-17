// 1. Creamos el contenedor principal
const div = document.createElement('div');
div.style.textAlign = 'center';
div.style.background = 'gray';
div.style.padding = '10px';

// 2. Inyectamos el texto (puedes seguir usando template strings para el texto)
div.innerHTML = `
  <h3 style="margin:0;">${gym.title}</h3>
  <p style="margin:5px 0;">${gym.category_name}</p>
  <p style="margin:5px 0;">${gym.phone}</p>
`;

// 3. Creamos el botón como un elemento DOM real
const btn = document.createElement('button');
btn.innerText = 'Ver detalles / Reservar';
btn.style.cssText = "background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer; margin-top:5px;";

// 4. El evento de clic: Usamos una función de flecha para evitar problemas de scope
btn.addEventListener('click', (e) => {
  e.stopPropagation(); // ¡Vital para que el mapa no ignore el clic en Android!
  window.location.href = `/owner/gym-owner-dashboard?name=${encodeURIComponent(gym.title)}`;
});

div.appendChild(btn);

// 5. Creamos el popup usando setDOMContent en lugar de setHTML
const popup = new maptilersdk.Popup({ offset: 25 }).setDOMContent(div);

new maptilersdk.Marker({ color: "#0000FF" })
  .setLngLat([gym.longitud, gym.latitud])
  .setPopup(popup)
  .addTo(map.current);
