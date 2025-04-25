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
        location.reload(); 
      } else {
        alert('Hiba a mentés során!');
      }
    });
  });

  

  fetch('/select')
    .then(res => res.json()) 
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
            <td>
              <button class="btn btn-sm btn-success me-1" onclick='hozzaadKosarhoz(${JSON.stringify(termek)})'>Kosárba</button>
              <button class="btn btn-sm btn-warning me-1" onclick='modositTermek(${termek.id})'>Módosítás</button>
              <button class="btn btn-sm btn-danger" onclick='torolTermek(${termek.id})'>Törlés</button>
            </td>
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

// Kosárkezelés
function hozzaadKosarhoz(termek) {
    let kosar = JSON.parse(localStorage.getItem('kosar')) || [];
    kosar.push(termek);
    localStorage.setItem('kosar', JSON.stringify(kosar));
    alert('Termék hozzáadva a kosárhoz!');
  }

// Termék törlése
function torolTermek(id) {
  if (confirm("Biztosan törölni szeretnéd ezt a terméket?")) {
    fetch(`/delete/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(valasz => {
      if (valasz.success) {
        alert('Termék sikeresen törölve!');
        location.reload();  // Frissíti a termékek listáját
      } else {
        alert('Hiba a törlés során: ' + valasz.error);
      }
    })
    .catch(err => {
      alert('Hiba történt a törlés során: ' + err.message);
    });
  }
}

// Termék módosítása
function modositTermek(id) {
  const modal = new bootstrap.Modal(document.getElementById('modositTermekModal'));
  modal.show();

  fetch('/api/kategoriak')
    .then(res => res.json())
    .then(kategoriak => {
      const select = document.getElementById('modositTermekKategoria');
      select.innerHTML = '';
      kategoriak.forEach(kat => {
        const option = document.createElement('option');
        option.value = kat.id;
        option.textContent = kat.name;
        select.appendChild(option);
      });
    });

  fetch(`/api/termek/${id}`)
    .then(res => res.json())
    .then(termek => {
      document.getElementById('modositTermekNev').value = termek.name;
      document.getElementById('modositTermekLeiras').value = termek.description;
      document.getElementById('modositTermekAr').value = termek.price;
      document.getElementById('modositTermekKategoria').value = termek.category_id;
      document.getElementById('modositTermekId').value = termek.id;
    });
}

document.getElementById('modositTermekForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const termek = {
    name: document.getElementById('modositTermekNev').value,
    description: document.getElementById('modositTermekLeiras').value,
    price: parseInt(document.getElementById('modositTermekAr').value),
    category_id: parseInt(document.getElementById('modositTermekKategoria').value)
  };

  const termekId = document.getElementById('modositTermekId').value;

  fetch(`/api/termek/${termekId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(termek)
  })
  .then(res => res.json())
  .then(valasz => {
    if (valasz.success) {
      location.reload();
    } else {
      alert('Hiba a módosítás során!');
    }
  });
});


