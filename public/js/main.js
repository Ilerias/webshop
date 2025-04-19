function nyitPopup() {
    // Bootstrap modal megnyitása
    const modal = new bootstrap.Modal(document.getElementById('ujTermekModal'));
    modal.show();
  
    // Kategóriák betöltése
    fetch('/api/kategoriak')
      .then(res => res.json())
      .then(kategoriak => {
        const select = document.getElementById('termekKategoria');
        select.innerHTML = '';
        kategoriak.forEach(kat => {
          const option = document.createElement('option');
          option.value = kat.id;
          option.textContent = kat.name;
          select.appendChild(option);
        });
      });
  }
  
  // Form elküldése új termék mentésére
  document.getElementById('ujTermekForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const ujTermek = {
      name: document.getElementById('termekNev').value,
      description: document.getElementById('termekLeiras').value,
      price: parseInt(document.getElementById('termekAr').value),
      category_id: parseInt(document.getElementById('termekKategoria').value)
    };
  
    fetch('/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ujTermek)
    })
    .then(res => res.json())
    .then(valasz => {
      if (valasz.success) {
        location.reload(); // oldal újratöltése
      } else {
        alert('Hiba a mentés során!');
      }
    });
  });

  

  fetch('/select')
    .then(res => res.json()) // JSON válasz
    .then(data => {
      if (Array.isArray(data)) {
        const tbody = document.querySelector('#termekTabla tbody');
        data.forEach(termek => {
          const sor = document.createElement('tr');
          sor.innerHTML = `
            <td>${termek.name}</td>
            <td>${termek.description}</td>
            <td>${termek.price}</td>
            <td>${termek.category ?? 'Ismeretlen'}</td>
          `;
          tbody.appendChild(sor);
        });
      } else {
        console.error('Nem tömb formátumú adatot kaptunk:', data);
      }
    })
    .catch(err => {
      console.error('Hiba:', err);
    });