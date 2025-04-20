 // Kosár megjelenítése
 function megjelenitKosarat() {
    const kosar = JSON.parse(localStorage.getItem('kosar')) || [];
    console.log(kosar);
    const kontener = document.getElementById('kosarTartalom');
    const osszegElem = document.getElementById('osszeg');
    
    if (!kontener || !osszegElem) return;
  
    if (kosar.length === 0) {
      kontener.innerHTML = '<p>A kosár üres.</p>';
      osszegElem.textContent = '0';
      return;
    }
  
    let html = '<ul class="list-group mb-3">';
    let osszesen = 0;
    kosar.forEach((termek, index) => {
      osszesen += termek.price;
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${termek.name} - ${termek.price} Ft
          <button class="btn btn-sm btn-danger" onclick="torolKosarbol(${index})">Törlés</button>
        </li>`;
    });
    html += '</ul>';
    kontener.innerHTML = html;
    osszegElem.textContent = osszesen;
  }

  
  // Termék törlése a kosárból
  function torolKosarbol(index) {
    let kosar = JSON.parse(localStorage.getItem('kosar')) || [];
    kosar.splice(index, 1);
    localStorage.setItem('kosar', JSON.stringify(kosar));
    megjelenitKosarat();
  }
  
  // Rendelés leadása (kosár törlés)
  function rendelesLead() {
    const kosar = JSON.parse(localStorage.getItem('kosar')) || [];
    const userId = document.getElementById('userSelect').value;
  
    if (!userId) {
      alert("Kérlek válassz ki egy felhasználót!");
      return;
    }
  
    if (kosar.length === 0) {
      alert("A kosár üres.");
      return;
    }
  
    fetch('/api/rendeles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, items: kosar })
    })
    .then(res => res.json())
    .then(valasz => {
      if (valasz.success) {
        alert("Sikeres rendelés! Mentve az adatbázisba.");
        localStorage.removeItem('kosar');
        location.reload();
      } else {
        alert("Hiba történt: " + valasz.message || 'ismeretlen hiba');
      }
    });
  }
  
  
  // Betöltéskor ellenőrizzük, ha cart.html-en vagyunk
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Az oldal betöltődött");
    megjelenitKosarat();
  });

  fetch('/api/users')
  .then(res => res.json())
  .then(users => {
    console.log("Felhasználók:", users);
    if (!Array.isArray(users)) {
      console.error("Nem tömböt kaptunk vissza!");
      return;
    }

    const select = document.getElementById('userSelect');
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      select.appendChild(option);
    });
  })
  .catch(err => console.error("Hiba a fetch-nél:", err));
