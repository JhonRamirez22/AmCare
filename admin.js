window.AmCareAdmin = (() => {
  const renderPanel = () => {
    const users = window.AmCareRoles.getUsers();
    const historias = window.AmCareHistoria.getHistorias();

    return `
      <div class="grid cols-2">
        <section class="card">
          <h2>Gestión de usuarios y roles</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${users
                  .map(
                    (u) => `
                  <tr>
                    <td>${u.nombre}</td>
                    <td>${u.email}</td>
                    <td>
                      <select data-role-user="${u.id}">
                        <option value="paciente" ${u.rol === 'paciente' ? 'selected' : ''}>Paciente</option>
                        <option value="medico" ${u.rol === 'medico' ? 'selected' : ''}>Médico</option>
                        <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Admin</option>
                      </select>
                    </td>
                    <td>${u.activo === false ? 'Inactivo' : 'Activo'}</td>
                    <td><button class="btn btn-outline" data-toggle-user="${u.id}">${u.activo === false ? 'Activar' : 'Desactivar'}</button></td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <h2>Estadísticas globales</h2>
          <div class="kpis">
            <article class="kpi"><small>Usuarios</small><strong>${users.length}</strong></article>
            <article class="kpi"><small>Historias clínicas</small><strong>${historias.length}</strong></article>
            <article class="kpi"><small>Médicos</small><strong>${users.filter((u) => u.rol === 'medico').length}</strong></article>
            <article class="kpi"><small>Pacientes</small><strong>${users.filter((u) => u.rol === 'paciente').length}</strong></article>
          </div>
          <canvas id="adminStatsChart" height="190"></canvas>
        </section>
      </div>

      <section class="card" style="margin-top:14px">
        <h2>Gestión total de historias</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Paciente</th><th>Última actualización</th><th>Actualizado por</th></tr>
            </thead>
            <tbody>
              ${historias
                .map(
                  (h) => `<tr><td>${h.id}</td><td>${h.pacienteNombre}</td><td>${h.ultimaActualizacion}</td><td>${h.actualizadoPor}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  };

  const bindPanelEvents = () => {
    const users = window.AmCareRoles.getUsers();

    document.querySelectorAll('[data-role-user]').forEach((el) => {
      el.addEventListener('change', () => {
        const id = Number(el.getAttribute('data-role-user'));
        const idx = users.findIndex((u) => u.id === id);
        if (idx < 0) return;
        users[idx].rol = el.value;
        window.AmCareRoles.setUsers(users);
        window.AmCareRoles.refreshCurrentUser();
        window.AmCareApp.rerender();
      });
    });

    document.querySelectorAll('[data-toggle-user]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-toggle-user'));
        const idx = users.findIndex((u) => u.id === id);
        if (idx < 0) return;
        users[idx].activo = users[idx].activo === false ? true : false;
        window.AmCareRoles.setUsers(users);
        window.AmCareRoles.refreshCurrentUser();
        window.AmCareApp.rerender();
      });
    });

    const chart = document.getElementById('adminStatsChart');
    if (chart && window.Chart) {
      new Chart(chart, {
        type: 'doughnut',
        data: {
          labels: ['Pacientes', 'Médicos', 'Admin'],
          datasets: [{
            data: [
              users.filter((u) => u.rol === 'paciente').length,
              users.filter((u) => u.rol === 'medico').length,
              users.filter((u) => u.rol === 'admin').length
            ],
            backgroundColor: ['#22c55e', '#166534', '#ea580c']
          }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
      });
    }
  };

  return { renderPanel, bindPanelEvents };
})();