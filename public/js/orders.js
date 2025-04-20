document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/orders')
      .then(res => res.json())
      .then(orders => {
        const rendelesekTartalom = document.getElementById('rendelesekTartalom');
  
        if (orders.length === 0) {
          rendelesekTartalom.innerHTML = '<p>Nincs megjeleníthető rendelés.</p>';
          return;
        }
  
        let html = '<table class="table table-bordered">';
        html += '<thead><tr><th>Rendelés dátuma</th><th>Felhasználó</th><th>Termék</th><th>Mennyiség</th><th>Ár</th></tr></thead><tbody>';
        orders.forEach(orders => {
          html += `
            <tr>
              <td>${orders.order_date}</td>
              <td>${orders.user_name}</td>
              <td>${orders.product_name}</td>
              <td>${orders.quantity}</td>
              <td>${orders.price} Ft</td>
            </tr>
          `;
        });
        html += '</tbody></table>';
        rendelesekTartalom.innerHTML = html;
      })
      .catch(err => {
        console.error('Hiba a rendelés adatainak betöltésekor:', err);
      });
  });
  