window.AmCareApp = (() => {
  const state = {
    selectedConversationId: null,
    jitsiApi: null,
    waitingTimer: null
  };

  const USUARIOS = [
    { id: 1, nombre: 'Dra. Sarah Johnson', email: 'sarah@amcare.co', password: 'medico123', rol: 'medico', especialidad: 'Medicina General', pacientesIds: [101, 102], activo: true },
    { id: 2, nombre: 'Dr. Michael Torres', email: 'michael@amcare.co', password: 'medico123', rol: 'medico', especialidad: 'Telepsiquiatría', pacientesIds: [103, 104], activo: true },
    { id: 3, nombre: 'Juan Pérez', email: 'juan@amcare.co', password: 'paciente123', rol: 'paciente', historiaId: 101, activo: true },
    { id: 4, nombre: 'María González', email: 'maria@amcare.co', password: 'paciente123', rol: 'paciente', historiaId: 102, activo: true },
    { id: 5, nombre: 'Admin AmCare', email: 'admin@amcare.co', password: 'admin123', rol: 'admin', activo: true }
  ];

  const HISTORIAS = [
    {
      id: 101,
      pacienteId: 3,
      pacienteNombre: 'Juan Pérez',
      fechaNacimiento: '1985-03-22',
      sexo: 'Masculino',
      tipoSangre: 'A+',
      alergias: ['Penicilina'],
      enfermedadesBase: ['Diabetes tipo 2'],
      antecedentesQuirurgicos: ['Hernia 2018'],
      antecedentesFamiliares: 'Madre con hipertensión',
      medicamentosActuales: [{ nombre: 'Metformina 500mg', dosis: '1 tableta con el desayuno', desde: '2021-01-10' }],
      consultas: [{
        id: 'c001',
        fecha: '2024-10-15',
        medico: 'Dra. Sarah Johnson',
        especialidad: 'Medicina General',
        tipo: 'Videollamada',
        motivo: 'Control diabetes',
        diagnostico: 'Diabetes tipo 2 compensada',
        tratamiento: 'Continuar Metformina. Dieta balanceada.',
        receta: { medicamento: 'Metformina 500mg', dosis: '1 tableta/día', duracion: '3 meses' },
        documentosAdjuntos: ['hemoglobina_glicosilada.pdf'],
        notasEvolucion: 'Paciente con buen control glucémico.'
      }],
      ultimaActualizacion: '2024-10-15',
      actualizadoPor: 'Dra. Sarah Johnson'
    },
    {
      id: 102,
      pacienteId: 4,
      pacienteNombre: 'María González',
      fechaNacimiento: '1992-11-09',
      sexo: 'Femenino',
      tipoSangre: 'O+',
      alergias: ['Ninguna'],
      enfermedadesBase: ['Hipotiroidismo'],
      antecedentesQuirurgicos: ['N/A'],
      antecedentesFamiliares: 'Padre con diabetes',
      medicamentosActuales: [{ nombre: 'Levotiroxina 50mcg', dosis: '1 tableta diaria', desde: '2020-08-01' }],
      consultas: [],
      ultimaActualizacion: '2025-01-02',
      actualizadoPor: 'Dr. Michael Torres'
    }
  ];

  const MEDICOS = [
    { id: 1, nombre: 'Dra. Sarah Johnson', especialidad: 'Medicina General', rating: 4.9, idioma: 'ES/EN' },
    { id: 2, nombre: 'Dr. Michael Torres', especialidad: 'Telepsiquiatría', rating: 4.8, idioma: 'ES/EN' },
    { id: 6, nombre: 'Dra. Laura Ramírez', especialidad: 'Pediatría', rating: 4.7, idioma: 'ES' },
    { id: 7, nombre: 'Dr. Andrés Molina', especialidad: 'Cardiología', rating: 4.8, idioma: 'ES' }
  ];

  const INIT_CONVERSATIONS = [
    {
      id: 'conv-101',
      historiaId: 101,
      pacienteNombre: 'Juan Pérez',
      medicoNombre: 'Dra. Sarah Johnson',
      medicoOnline: true,
      messages: [
        { by: 'medico', text: 'Hola Juan, ¿cómo te has sentido esta semana?', at: '2026-04-14 08:32' },
        { by: 'paciente', text: 'Me he sentido bien, tengo exámenes de laboratorio.', at: '2026-04-14 08:35' }
      ]
    },
    {
      id: 'conv-102',
      historiaId: 102,
      pacienteNombre: 'María González',
      medicoNombre: 'Dr. Michael Torres',
      medicoOnline: false,
      messages: [
        { by: 'medico', text: 'Recuerda tomar la medicación a la misma hora.', at: '2026-04-13 17:50' }
      ]
    }
  ];

  const MEDIA = {
    shared: './assets/amcare-connected-care.jpg'
  };

  const $ = (s) => document.querySelector(s);
  const t = (k) => window.AmCareI18n.t(k);

  const safeParse = (raw, fallback) => {
    try {
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const safeArray = (key, fallback = []) => {
    const parsed = safeParse(localStorage.getItem(key), fallback);
    return Array.isArray(parsed) ? parsed : fallback;
  };

  const getRouteState = () => {
    const hashRaw = window.location.hash || '#/login';
    const clean = hashRaw.replace('#', '') || '/';
    const [routePart, queryPart = ''] = clean.split('?');
    return { route: routePart || '/', query: new URLSearchParams(queryPart) };
  };

  const getAppointments = () => safeArray('amcare-appointments', []);
  const setAppointments = (appointments) => localStorage.setItem('amcare-appointments', JSON.stringify(appointments));
  const getMedicos = () => safeArray('amcare-medicos', []);

  const fmtDateTime = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
  };

  const initData = () => {
    const ensureArrayKey = (key, fallback) => {
      const current = safeParse(localStorage.getItem(key), null);
      if (!Array.isArray(current)) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
    };

    ensureArrayKey('amcare-users', USUARIOS);
    ensureArrayKey('amcare-historias', HISTORIAS);
    ensureArrayKey('amcare-medicos', MEDICOS);
    ensureArrayKey('amcare-conversations', INIT_CONVERSATIONS);
    ensureArrayKey('amcare-recetas', []);
    ensureArrayKey('amcare-documentos', []);
    ensureArrayKey('amcare-appointments', [
      { id: `a-${Date.now()}`, historiaId: 101, paciente: 'Juan Pérez', medico: 'Dra. Sarah Johnson', tipo: 'Videollamada', fecha: '2026-04-16 11:00', estado: 'Confirmada' }
    ]);

    const currentUser = safeParse(localStorage.getItem('amcare-current-user'), null);
    if (currentUser && typeof currentUser !== 'object') {
      localStorage.removeItem('amcare-current-user');
    }

    window.AmCareAgenda.initAgendaDefaults();
  };

  const navLinks = (user) => {
    const base = [{ to: '#/', label: t('home') }];

    if (!user) {
      base.push({ to: '#/login', label: t('login') });
      return base;
    }

    if (user?.rol === 'paciente') {
      base.push(
        { to: '#/buscar', label: t('findDoctors') },
        { to: '#/agendar', label: t('schedule') },
        { to: '#/chat', label: t('chat') },
        { to: '#/consulta', label: t('consultation') },
        { to: '#/panel', label: t('patientPanel') },
        { to: '#/mi-historia', label: t('myHistory') }
      );
      base.push(
        { to: '#/planes', label: t('plans') },
        { to: '#/casos-de-uso', label: t('useCases') },
        { to: '#/seguridad', label: t('security') },
        { to: '#/ayuda', label: t('help') }
      );
    }

    if (user?.rol === 'medico') {
      base.push(
        { to: '#/panel-medico', label: t('doctorPanel') },
        { to: '#/mis-pacientes', label: t('myPatients') },
        { to: '#/mi-agenda', label: t('myAgenda') },
        { to: '#/chat', label: t('chat') },
        { to: '#/consulta', label: t('consultation') },
        { to: '#/planes', label: t('plans') },
        { to: '#/casos-de-uso', label: t('useCases') },
        { to: '#/seguridad', label: t('security') },
        { to: '#/ayuda', label: t('help') }
      );
    }

    if (user?.rol === 'admin') {
      base.push(
        { to: '#/admin', label: 'Admin' },
        { to: '#/planes', label: t('plans') },
        { to: '#/casos-de-uso', label: t('useCases') },
        { to: '#/seguridad', label: t('security') },
        { to: '#/ayuda', label: t('help') }
      );
    }

    return base;
  };

  const STATIC_TEXT_MAP = {
    en: {
      'Urgencias 24/7': 'Urgent Care 24/7',
      'Móvil': 'Mobile',
      'Escritorio': 'Desktop',
      'Especialidades médicas': 'Medical specialties',
      'Atención primaria integral': 'Comprehensive primary care',
      'Salud mental y seguimiento': 'Mental health and follow-up',
      'Consulta infantil remota': 'Remote pediatric consultation',
      'Control y prevención cardiovascular': 'Cardiovascular care and prevention',
      'Casos de uso destacados': 'Featured use cases',
      'Ver casos de uso completos': 'View full use cases',
      'One platform for care delivery': 'One platform for care delivery',
      'Usuarios cubiertos': 'Covered users',
      'Sistemas de salud': 'Health systems',
      'Visitas virtuales': 'Virtual visits',
      'Iniciar videoconsulta': 'Start video consultation',
      'Casos de referencia en salud digital': 'Digital health benchmark cases',
      'Ingresa a tu entorno clínico': 'Access your clinical environment',
      'Acceso rápido por rol (demo)': 'Quick role access (demo)',
      'Paciente': 'Patient',
      'Médico': 'Doctor',
      'Contraseña': 'Password',
      'Entrar': 'Sign in',
      'Cerrar sesión': 'Log out',
      'Dashboard del paciente': 'Patient dashboard',
      'Panel médico': 'Doctor dashboard',
      'Mis citas': 'My appointments',
      'Mis recetas': 'My prescriptions',
      'Mis documentos': 'My documents',
      'Sin documentos': 'No documents',
      'Sin recetas nuevas': 'No new prescriptions',
      'Mi agenda (FullCalendar)': 'My schedule (FullCalendar)',
      'Duración consulta (min)': 'Consultation length (min)',
      'Días laborales': 'Work days',
      'Horario de atención': 'Working hours',
      'Haz clic en el calendario para crear bloques.': 'Click the calendar to create blocks.',
      'Gestión de usuarios y roles': 'User and role management',
      'Estadísticas globales': 'Global statistics',
      'Gestión total de historias': 'Global medical records management',
      'Requisitos mínimos': 'Minimum requirements',
      'Preguntas frecuentes': 'Frequently asked questions',
      'Consentimiento informado digital': 'Digital informed consent',
      'Seguridad y cumplimiento': 'Security and compliance',
      'Citas programadas': 'Scheduled appointments',
      'Iniciar consulta': 'Start consultation',
      'Cancelar': 'Cancel',
      'Entrar': 'Join',
      'Sin citas activas.': 'No active appointments.',
      'Sin citas registradas': 'No appointments registered',
      'No hay citas agendadas.': 'No scheduled appointments.',
      'No hay citas de videollamada pendientes.': 'No pending video appointments.'
    },
    es: {
      'Urgent Care 24/7': 'Urgencias 24/7',
      'Mobile': 'Móvil',
      'Desktop': 'Escritorio',
      'Medical specialties': 'Especialidades médicas',
      'Comprehensive primary care': 'Atención primaria integral',
      'Mental health and follow-up': 'Salud mental y seguimiento',
      'Remote pediatric consultation': 'Consulta infantil remota',
      'Cardiovascular care and prevention': 'Control y prevención cardiovascular',
      'Featured use cases': 'Casos de uso destacados',
      'View full use cases': 'Ver casos de uso completos',
      'Covered users': 'Usuarios cubiertos',
      'Health systems': 'Sistemas de salud',
      'Virtual visits': 'Visitas virtuales',
      'Start video consultation': 'Iniciar videoconsulta',
      'Digital health benchmark cases': 'Casos de referencia en salud digital',
      'Access your clinical environment': 'Ingresa a tu entorno clínico',
      'Quick role access (demo)': 'Acceso rápido por rol (demo)',
      'Password': 'Contraseña',
      'Sign in': 'Ingresar',
      'Patient dashboard': 'Panel paciente',
      'Doctor dashboard': 'Panel médico',
      'My appointments': 'Mis citas',
      'My prescriptions': 'Mis recetas',
      'My documents': 'Mis documentos',
      'No documents': 'Sin documentos',
      'No new prescriptions': 'Sin recetas nuevas',
      'My schedule (FullCalendar)': 'Mi agenda (FullCalendar)',
      'Consultation length (min)': 'Duración consulta (min)',
      'Work days': 'Días laborales',
      'Working hours': 'Horario de atención',
      'Click the calendar to create blocks.': 'Haz clic en el calendario para crear bloques.',
      'User and role management': 'Gestión de usuarios y roles',
      'Global statistics': 'Estadísticas globales',
      'Global medical records management': 'Gestión total de historias',
      'Minimum requirements': 'Requisitos mínimos',
      'Frequently asked questions': 'Preguntas frecuentes',
      'Digital informed consent': 'Consentimiento informado digital',
      'Security and compliance': 'Seguridad y cumplimiento',
      'Scheduled appointments': 'Citas programadas',
      'Start consultation': 'Iniciar consulta',
      'Join': 'Entrar',
      'No active appointments.': 'Sin citas activas.',
      'No appointments registered': 'Sin citas registradas',
      'No scheduled appointments.': 'No hay citas agendadas.',
      'No pending video appointments.': 'No hay citas de videollamada pendientes.'
    }
  };

  const applyStaticTranslations = () => {
    const lng = localStorage.getItem('amcare-lang') || 'es';
    const map = STATIC_TEXT_MAP[lng];
    if (!map) return;

    const root = document.getElementById('root');
    if (!root) return;

    const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node?.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const parentTag = node.parentElement?.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      let value = node.nodeValue;
      entries.forEach(([from, to]) => {
        if (value.includes(from)) value = value.replaceAll(from, to);
      });
      node.nodeValue = value;
    });

    root.querySelectorAll('[placeholder]').forEach((el) => {
      const current = el.getAttribute('placeholder') || '';
      let translated = current;
      entries.forEach(([from, to]) => {
        if (translated.includes(from)) translated = translated.replaceAll(from, to);
      });
      if (translated !== current) el.setAttribute('placeholder', translated);
    });
  };

  const renderShell = (route, user, content) => {
    const lang = localStorage.getItem('amcare-lang') || 'es';
    const isGuestLogin = route === '/login' && !user;
    const roleBadge = user
      ? `<span class="badge ${window.AmCareRoles.roleBadgeClass(user.rol)}">${window.AmCareRoles.ROLE_LABEL[user.rol]}</span>`
      : '';

    const html = `
      <div class="app-shell ${isGuestLogin ? 'login-mode' : ''}">
        <header class="navbar">
          <div class="navbar-inner">
            <div class="brand">
              <div class="brand-logo"><i data-lucide="video"></i><i data-lucide="plus" style="position:absolute;width:14px;height:14px;margin-left:20px;margin-top:20px;background:#fff;border-radius:50%;padding:2px;"></i></div>
              <div>
                <h1>${t('appName')}</h1>
                <small>${t('appSubtitle')}</small>
              </div>
            </div>
            <div class="nav-right">
              <span class="badge badge-hipaa">${t('hipaa')}</span>
              ${roleBadge}
              <div style="display:flex;gap:6px;">
                <button class="lang-select" data-lang="es" style="border-color:${lang === 'es' ? 'var(--primary)' : 'var(--border)'}"><img src="https://flagcdn.com/24x18/co.png" alt="CO" /> ES</button>
                <button class="lang-select" data-lang="en" style="border-color:${lang === 'en' ? 'var(--primary)' : 'var(--border)'}"><img src="https://flagcdn.com/24x18/us.png" alt="US" /> EN</button>
              </div>
              ${user ? '<button class="btn btn-outline" id="logoutBtn">' + t('logout') + '</button>' : ''}
            </div>
          </div>
          <nav class="main-nav ${isGuestLogin ? 'hidden' : ''}">
            ${navLinks(user)
              .map((l) => {
                const clean = l.to.replace('#', '');
                const active = clean === '/' ? route === '/' : route.startsWith(clean);
                return `<a href="${l.to}" class="${active ? 'active' : ''}">${l.label}</a>`;
              })
              .join('')}
          </nav>
        </header>

        <main class="container ${isGuestLogin ? 'container-login' : ''}">${content}</main>

        <footer class="footer">
          <div class="footer-inner">
            <p><strong>${t('footerWorks')}</strong></p>
            <div>
              <span class="footer-badge">HIPAA</span>
              <span class="footer-badge">${t('footerSsl')}</span>
              <span class="footer-badge">ISO 27001</span>
              <span class="footer-badge">${t('footerConfidential')}</span>
            </div>
            <div class="footer-grid">
              <p class="notice"><strong>${t('importantNotice')}</strong> Requiere conexión estable a internet · No reemplaza completamente la consulta presencial · Disponibilidad según plan y horario del médico.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    $('#root').innerHTML = html;
    bindCommonEvents();
    if (window.lucide) window.lucide.createIcons();
    applyStaticTranslations();
  };

  const cardVentaja = (icon, title, txt) => `
    <article class="card">
      <h3><i data-lucide="${icon}"></i> ${title}</h3>
      <p>${txt}</p>
    </article>
  `;

  const mediaImg = (src, alt, cls = '') => `
    <figure class="media-frame ${cls}">
      <img src="${src}" alt="${alt}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')" />
    </figure>
  `;

  const pageHome = () => `
    <section class="hero hero-grid">
      <article class="hero-copy">
        <p class="tag">${t('quickConsult')}</p>
        <h2>${t('heroTitle')}</h2>
        <p>${t('heroText')}</p>
        <div class="cta">
          <a class="btn btn-primary" href="#/agendar">${t('startNow')}</a>
          <a class="btn btn-outline" href="#/planes">${t('seePlans')}</a>
          <a class="btn btn-outline" href="#/urgencias">Urgencias 24/7</a>
        </div>
        <div style="margin-top:12px">
          <span class="tag"><i data-lucide="smartphone"></i> Móvil</span>
          <span class="tag"><i data-lucide="tablet"></i> Tablet</span>
          <span class="tag"><i data-lucide="monitor"></i> Escritorio</span>
        </div>
      </article>
      <article class="hero-media">
  ${mediaImg(MEDIA.shared, 'Imagen de interfaz', 'hero-image')}
        <h3 style="margin-top:0">One platform for care delivery</h3>
        <p>Plataforma digital de salud con acceso continuo, cobertura amplia y operación clínica escalable.</p>
        <div class="metric-strip">
          <div><small>Usuarios cubiertos</small><strong>+90M</strong></div>
          <div><small>Sistemas de salud</small><strong>80+</strong></div>
          <div><small>Visitas virtuales</small><strong>37.6M</strong></div>
        </div>
        <a class="btn btn-success" href="#/consulta">Iniciar videoconsulta</a>
      </article>
    </section>

    <section class="trust-logos card" style="margin-top:14px">
      <small>Casos de referencia en salud digital</small>
  ${mediaImg(MEDIA.shared, 'Imagen de interfaz', 'trust-image')}
      <div class="trust-logos-row">
        <span>Cleveland Clinic</span>
        <span>Banner Health</span>
        <span>Cedars-Sinai</span>
        <span>UnitedHealthcare</span>
        <span>Blue Cross</span>
      </div>
    </section>

    <section class="card" style="margin-top:14px">
      <h2>Especialidades médicas</h2>
  ${mediaImg(MEDIA.shared, 'Imagen de interfaz', 'specialty-image')}
      <div class="grid cols-4">
        <div class="card"><strong>Medicina General</strong><p>Atención primaria integral</p></div>
        <div class="card"><strong>Telepsiquiatría</strong><p>Salud mental y seguimiento</p></div>
        <div class="card"><strong>Pediatría</strong><p>Consulta infantil remota</p></div>
        <div class="card"><strong>Cardiología</strong><p>Control y prevención cardiovascular</p></div>
      </div>
    </section>

    <section style="margin-top:14px">
      <h2>${t('whyAmcare')}</h2>
      <div class="grid cols-3">
        ${cardVentaja('globe', 'Acceso desde cualquier lugar', 'Conéctate desde casa, trabajo o zonas rurales.')}
        ${cardVentaja('clock', 'Reducción de tiempos de espera', 'Agenda y consulta sin filas largas.')}
        ${cardVentaja('shield-check', 'Mayor cobertura en salud', 'Acercamos especialistas a más territorios.')}
        ${cardVentaja('activity', 'Continuidad del tratamiento', 'Seguimiento clínico con recordatorios.')}
        ${cardVentaja('lock', 'Seguridad HIPAA garantizada', 'Protección de datos y privacidad clínica.')}
        ${cardVentaja('file-medical', 'Integración con historia clínica', 'Información unificada de consultas y recetas.')}
      </div>
    </section>

    <section class="card" style="margin-top:14px">
      <h2>Casos de uso destacados</h2>
      <p>Hospitales, aseguradoras y redes internacionales usando modelos de telemedicina.</p>
      <a class="btn btn-outline" href="#/casos-de-uso">Ver casos de uso completos</a>
    </section>
  `;

  const pageLogin = () => `
    <section class="login-wrap">
      <article class="login-brand-panel">
        <p class="tag">AmCare Access</p>
        <h2>Ingresa a tu entorno clínico</h2>
        <p>Plataforma unificada para paciente, médico y administrador. Acceso seguro con enfoque en experiencia de telemedicina moderna.</p>
        <ul class="list">
          <li><i data-lucide="shield-check"></i> Seguridad y cumplimiento HIPAA / Ley 1581</li>
          <li><i data-lucide="video"></i> Videoconsultas integradas en segundos</li>
          <li><i data-lucide="file-text"></i> Historia clínica, recetas y documentos en un solo panel</li>
        </ul>
      </article>

      <article class="login-form-panel card">
        <h2>${t('login')}</h2>
        <form id="loginForm">
          <div class="form-group"><label>Email</label><input type="email" id="loginEmail" required placeholder="usuario@amcare.co" /></div>
          <div class="form-group"><label>Contraseña</label><input type="password" id="loginPassword" required placeholder="••••••••" /></div>
          <button class="btn btn-primary btn-block" type="submit">Ingresar</button>
        </form>
        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;">
        <p style="margin:0 0 8px;"><strong>Acceso rápido por rol (demo)</strong></p>
        <div class="quick-role-grid">
          <button class="btn btn-outline" data-quick="paciente"><i data-lucide="user"></i> Paciente</button>
          <button class="btn btn-outline" data-quick="medico"><i data-lucide="stethoscope"></i> Médico</button>
          <button class="btn btn-outline" data-quick="admin"><i data-lucide="shield"></i> Admin</button>
        </div>
      </article>
    </section>
  `;

  const pageBuscar = () => {
    const medicos = JSON.parse(localStorage.getItem('amcare-medicos') || '[]');
    return `
      <section class="card">
        <h2>Directorio de médicos</h2>
        <div class="grid cols-3">
          <div class="form-group"><label>Nombre o especialidad</label><input id="medicoFilter" placeholder="Ej. pediatría" /></div>
          <div class="form-group"><label>Idioma</label><select id="idiomaFilter"><option value="">Todos</option><option>ES</option><option>EN</option><option>ES/EN</option></select></div>
          <div class="form-group" style="display:flex;align-items:flex-end;"><button class="btn btn-primary" id="applyDoctorFilter">Filtrar</button></div>
        </div>
        <div class="grid cols-2" id="doctorList">
          ${medicos
            .map(
              (m) => `
              <article class="card">
                <div class="avatar-row">
                  <img class="avatar" src="https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(m.nombre)}" alt="avatar" />
                  <div><strong>${m.nombre}</strong><br /><small>${m.especialidad} · ⭐ ${m.rating}</small></div>
                </div>
                <p style="margin:10px 0;">Idiomas: ${m.idioma}</p>
                <a class="btn btn-outline" href="#/perfil?medico=${m.id}">Ver perfil</a>
              </article>
            `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const pagePerfil = (query) => {
    const medicos = getMedicos();
    const medicoId = Number(query?.get('medico') || 1);
    const m = medicos.find((doc) => doc.id === medicoId) || medicos[0] || { id: 1, nombre: 'Dra. Sarah Johnson', especialidad: 'Medicina General', rating: 4.9, idioma: 'ES/EN' };

    return `
    <section class="grid cols-2">
      <article class="card">
        <h2>Perfil del especialista</h2>
        <div class="avatar-row">
          <img class="avatar" src="https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(m.nombre)}" alt="avatar" />
          <div><strong>${m.nombre}</strong><br /><small>${m.especialidad} · ⭐ ${m.rating} · Idioma ${m.idioma}</small></div>
        </div>
        <p>Atención en control de enfermedades crónicas, valoración inicial y seguimiento de tratamiento.</p>
        <a class="btn btn-primary" href="#/agendar?medico=${m.id}">Agendar consulta</a>
      </article>
      <article class="card">
        <h3>Disponibilidad semanal (FullCalendar)</h3>
        <div id="calendarProfile"></div>
      </article>
    </section>
  `;
  };

  const pageAgendar = (user, query) => {
    const medicos = getMedicos();
    const selectedMedicoId = Number(query?.get('medico') || localStorage.getItem('amcare-selected-medico-id') || medicos[0]?.id || 1);
    const citas = getAppointments()
      .filter((c) => c.estado !== 'Cancelada' && (!user || user.rol !== 'paciente' || c.historiaId === user.historiaId))
      .slice(0, 6);

    return `
    <section class="grid cols-2">
      <article class="card">
        <h2>Agendar consulta</h2>
        <form id="agendarForm">
          <div class="form-group">
            <label>Especialista</label>
            <select id="medicoConsulta">
              ${medicos
                .map((m) => `<option value="${m.id}" ${m.id === selectedMedicoId ? 'selected' : ''}>${m.nombre} · ${m.especialidad}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de consulta</label>
            <select id="tipoConsulta"><option>Videollamada</option><option>Chat</option><option>Control urgente</option></select>
          </div>
          <div class="form-group"><label>Horario</label><input type="datetime-local" id="fechaConsulta" required /></div>
          <div class="form-group"><label>Motivo</label><textarea id="motivoConsulta" required></textarea></div>
          <div class="form-group"><label>Síntomas principales</label><input id="sintomas" /></div>
          <button class="btn btn-primary btn-block" type="submit">Confirmar agendamiento</button>
        </form>
      </article>
      <article class="card">
        <h3>Agenda disponible (solo lectura paciente)</h3>
        <div id="calendarPatient"></div>
        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;" />
        <h4>Mis citas próximas</h4>
        <ul class="list">
          ${citas.length
            ? citas
                .map(
                  (c) => `<li><strong>${fmtDateTime(c.fecha)}</strong> · ${c.tipo} · ${c.medico}<br/><small>Estado: ${c.estado}</small><br/><div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-outline" data-join-appt="${c.id}">Entrar</button><button class="btn btn-danger" data-cancel-appt="${c.id}">Cancelar</button></div></li>`
                )
                .join('')
            : '<li>No tienes citas agendadas.</li>'}
        </ul>
      </article>
    </section>
  `;
  };

  const pageConsulta = (user) => {
    const citasVideo = getAppointments()
      .filter((c) => c.tipo === 'Videollamada' && c.estado === 'Confirmada')
      .filter((c) => {
        if (!user) return true;
        if (user.rol === 'paciente') return c.historiaId === user.historiaId;
        if (user.rol === 'medico') return c.medico === user.nombre;
        return true;
      })
      .slice(0, 6);

    return `
    <section class="grid cols-2">
      <article class="card">
        <h2>Sala de videollamada (Jitsi)</h2>
        <p>Se creará una sala única: <strong>AmCare-{especialista}-{timestamp}</strong></p>
        <div class="form-group"><label>Especialista</label><input id="jitsiDoctor" value="${localStorage.getItem('amcare-next-doctor') || 'DraSarahJohnson'}" /></div>
        <button class="btn btn-primary" id="startVideoCall">Iniciar consulta</button>
        <button class="btn btn-outline" id="leaveCall">Salir</button>
        <div id="waitingArea" style="margin-top:14px;display:none;">
          <p>Sala de espera virtual</p>
          <div class="countdown" id="countdown">5</div>
        </div>
        <div id="jitsi-container" style="display:none;margin-top:12px;"></div>
      </article>

      <article class="card">
        <h3>Herramientas de consulta</h3>
        <h4>Citas de videollamada programadas</h4>
        <ul class="list">
          ${citasVideo.length
            ? citasVideo
                .map(
                  (c) => `<li>${fmtDateTime(c.fecha)} · ${c.paciente} · ${c.medico}<br/><button class="btn btn-outline" data-open-room="${c.roomName}">Entrar a sala programada</button></li>`
                )
                .join('')
            : '<li>No hay citas de videollamada pendientes.</li>'}
        </ul>
        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;" />
        <div class="form-group"><label>Adjuntar documento</label><input type="file" id="consultaDoc" /></div>
        <button class="btn btn-outline" id="attachConsultaDoc">Adjuntar documento</button>
        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;" />
        ${user?.rol === 'medico' ? `
          <h4>Emitir receta electrónica</h4>
          <form id="rxForm">
            <div class="form-group"><label>Historia ID</label><input id="rxHistoriaId" value="101" /></div>
            <div class="form-group"><label>Medicamento</label><input id="rxMedicamento" required /></div>
            <div class="form-group"><label>Dosis</label><input id="rxDosis" required /></div>
            <div class="form-group"><label>Frecuencia</label><input id="rxFrecuencia" required /></div>
            <div class="form-group"><label>Duración</label><input id="rxDuracion" required /></div>
            <div class="form-group"><label>Observaciones</label><textarea id="rxObs"></textarea></div>
            <button class="btn btn-success" type="submit">Generar receta imprimible</button>
          </form>
          <div id="rxPrintCard" style="margin-top:10px"></div>
        ` : '<p>La emisión de recetas está disponible para médicos.</p>'}
      </article>
    </section>
  `;
  };

  const pageChat = (user) => {
    const conversations = JSON.parse(localStorage.getItem('amcare-conversations') || '[]');
    const list = user?.rol === 'paciente'
      ? conversations.filter((c) => window.AmCareHistoria.findById(c.historiaId)?.pacienteId === user.id)
      : user?.rol === 'medico'
        ? conversations.filter((c) => c.medicoNombre === user.nombre)
        : conversations;

    if (!state.selectedConversationId && list[0]) state.selectedConversationId = list[0].id;
    const selected = list.find((c) => c.id === state.selectedConversationId) || list[0];

    return `
      <section class="chat-shell">
        <aside class="chat-list">
          ${list
            .map(
              (c) => `
              <div style="padding:10px;border-bottom:1px solid var(--border);cursor:pointer;" data-open-chat="${c.id}">
                <div class="avatar-row">
                  <img class="avatar" src="https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(c.medicoNombre)}" alt="avatar" />
                  <div>
                    <strong>${user?.rol === 'paciente' ? c.medicoNombre : c.pacienteNombre}</strong><br />
                    <small>${c.medicoOnline ? 'Médico en línea' : 'Médico fuera de línea'}</small>
                  </div>
                </div>
              </div>
            `
            )
            .join('')}
        </aside>

        <article class="chat-window">
          <div class="messages" id="msgBox">
            ${selected
              ? selected.messages
                  .map(
                    (m) => `<div class="msg ${m.by === (user?.rol === 'paciente' ? 'paciente' : 'medico') ? 'me' : 'other'}">${m.text}<br /><small>${m.at}</small></div>`
                  )
                  .join('')
              : '<p style="padding:10px">No hay conversaciones.</p>'}
          </div>
          <div style="padding:10px;border-top:1px solid var(--border);">
            <input id="chatInput" placeholder="Escribe un mensaje..." />
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input type="file" id="chatFile" />
              <button class="btn btn-primary" id="sendMsg">Enviar</button>
            </div>
          </div>
        </article>
      </section>
    `;
  };

  const pageUrgencias = () => `
    <section class="grid cols-2">
      <article class="card">
        <h2>Urgencias digitales</h2>
        <p>Tiempo estimado de espera: <strong>6 minutos</strong></p>
        <ul class="list">
          <li>1. Clasificación inicial por síntomas</li>
          <li>2. Asignación de médico de guardia</li>
          <li>3. Videollamada inmediata</li>
        </ul>
        <a class="btn btn-danger" href="#/consulta">Iniciar atención inmediata</a>
      </article>
      <article class="card">
        <h3>Recomendación</h3>
        <p>Si presentas dolor de pecho intenso, dificultad respiratoria grave o pérdida de conciencia, acude de inmediato al servicio de urgencias presencial más cercano.</p>
      </article>
    </section>
  `;

  const pagePlanes = () => `
    <section class="card">
      <h2>Planes y licenciamiento</h2>
      <div class="grid cols-4">
        <article class="card"><h3>Plan Gratuito</h3><p><strong>$0</strong></p><p>1 chat/mes · directorio médico · historial básico</p></article>
        <article class="card"><h3>Plan Personal</h3><p><strong>$49.900 COP/mes</strong></p><p>Videoconsultas, chat, recetas, HCE completa y recordatorios</p></article>
        <article class="card"><h3>Plan Institucional</h3><p><strong>Cotización personalizada</strong></p><p>Multiusuario, reportes, integración HCE externa, soporte 24/7</p><button class="btn btn-outline">Solicitar demostración</button></article>
        <article class="card"><h3>Hospital / Clínica</h3><p><strong>Cotización personalizada</strong></p><p>Telepsiquiatría, urgencias, API integración, account manager</p><button class="btn btn-outline">Hablar con un asesor</button></article>
      </div>
    </section>

    <section class="card" style="margin-top:14px">
      <h3>Tabla comparativa</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Característica</th><th>Gratuito</th><th>Personal</th><th>Institucional</th><th>Hospital</th></tr></thead>
          <tbody>
            <tr><td>Chat médico</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Videollamada</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Recetas electrónicas</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Panel admin</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td></tr>
            <tr><td>Integración HCE externa</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td></tr>
          </tbody>
        </table>
      </div>
      <canvas id="plansChart" height="120"></canvas>
      <p style="margin-top:10px"><span class="tag">🇺🇸 EE.UU</span><span class="tag">🇮🇱 Israel</span><span class="tag">🇨🇴 Colombia</span></p>
    </section>
  `;

  const pageCasosUso = () => {
    const cats = [
      { titulo: 'Hospitales y sistemas de salud (EE.UU.)', items: ['Cleveland Clinic', 'Banner Health', 'Cedars-Sinai Medical Center', 'Intermountain Healthcare'], flag: 'us', desc: 'Implementaciones para escala hospitalaria.' },
  { titulo: 'Programas de telepsiquiatría y psicología', items: ['Cleveland Clinic', 'Medical Group Network'], flag: 'us', desc: 'Seguimiento continuo de salud mental.' },
      { titulo: 'Aseguradoras de salud', items: ['UnitedHealthcare', 'Anthem Inc.', 'Blue Cross Blue Shield'], flag: 'us', desc: 'Cobertura digital para afiliados.' },
      { titulo: 'Uso en Israel', items: ['Clalit Health Services', 'Maccabi Healthcare Services'], flag: 'il', desc: 'Modelos nacionales de telemedicina.' },
      { titulo: 'Expansión Latinoamérica (AmCare)', items: ['Colombia', 'México', 'Argentina'], flag: 'co', desc: 'Adaptación regional para LATAM.' }
    ];

    return `
      <section class="grid cols-2">
        ${cats
          .map(
            (c) => `
          <article class="card">
            <h3>${c.titulo}</h3>
            <div class="avatar-row">
              <img class="avatar" src="https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(c.titulo)}" alt="logo" />
              <img src="https://flagcdn.com/24x18/${c.flag}.png" alt="flag" />
            </div>
            <p>${c.desc}</p>
            <ul class="list">${c.items.map((i) => `<li>${i}</li>`).join('')}</ul>
          </article>`
          )
          .join('')}
      </section>
      <section class="card" style="margin-top:14px">
        <h3>Mapa de ubicaciones de clínicas afiliadas (Leaflet)</h3>
        <div id="clinicMap" class="map-box"></div>
      </section>
    `;
  };

  const pageSeguridad = () => `
    <section class="grid cols-2">
      <article class="card">
        <h2>Seguridad y cumplimiento</h2>
        <p>AmCare adopta lineamientos de cumplimiento HIPAA y los adapta al contexto latinoamericano con referencia a la Ley 1581/2012 de Protección de Datos Personales en Colombia.</p>
        <ul class="list">
          <li>Cifrado SSL/TLS para datos en tránsito.</li>
          <li>Cifrado end-to-end en videollamadas embebidas.</li>
          <li>Control de acceso por rol y sesiones locales.</li>
          <li>Política de no compartir datos con terceros sin consentimiento.</li>
        </ul>
      </article>
      <article class="card">
        <h3>Consentimiento informado digital</h3>
        <p>Antes de cada consulta, el paciente acepta el consentimiento digital para tratamiento de datos y acto médico remoto.</p>
        <label><input type="checkbox" /> Acepto el consentimiento informado para atención por telemedicina.</label>
      </article>
    </section>
  `;

  const pageAyuda = () => `
    <section class="grid cols-2">
      <article class="card">
        <h2>Requisitos mínimos</h2>
        <ul class="list">
          <li>Conexión a internet estable (mínimo 2 Mbps para videollamada)</li>
          <li>Dispositivo: celular, tablet o computador</li>
          <li>Navegador: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+</li>
          <li>Sin instalación requerida — 100% web</li>
        </ul>
      </article>
      <article class="card">
        <h3>${t('limitationsTitle')}</h3>
        <ul class="list">
          <li>Requiere conexión estable a internet</li>
          <li>No reemplaza completamente la consulta presencial</li>
          <li>Disponibilidad según plan y horario del médico</li>
        </ul>
      </article>
    </section>
    <section class="card" style="margin-top:14px">
      <h3>Preguntas frecuentes</h3>
      <p><strong>¿Necesito app?</strong> No, todo funciona en la web.</p>
      <p><strong>¿Puedo adjuntar resultados?</strong> Sí, desde chat o consulta.</p>
      <p><strong>¿Mis datos están protegidos?</strong> Sí, bajo prácticas de cumplimiento y cifrado.</p>
    </section>
  `;

  const renderHistoryDetail = (h, readOnly) => `
    <section class="card">
      <h2>Historia Clínica #${h.id} — ${h.pacienteNombre}</h2>
      ${readOnly ? '<span class="badge badge-role-paciente">Solo lectura — Contacta a tu médico para cambios</span>' : ''}
      <div class="grid cols-2" style="margin-top:10px">
        <div><strong>Fecha nacimiento:</strong> ${h.fechaNacimiento}</div>
        <div><strong>Sexo:</strong> ${h.sexo}</div>
        <div><strong>Tipo sangre:</strong> ${h.tipoSangre}</div>
        <div><strong>Alergias:</strong> ${h.alergias.join(', ')}</div>
        <div><strong>Enfermedades base:</strong> ${h.enfermedadesBase.join(', ')}</div>
        <div><strong>Antecedentes quirúrgicos:</strong> ${h.antecedentesQuirurgicos.join(', ')}</div>
      </div>
      <p><strong>Antecedentes familiares:</strong> ${h.antecedentesFamiliares}</p>
      <h3>Medicamentos actuales</h3>
      <ul class="list">${h.medicamentosActuales.map((m) => `<li>${m.nombre} · ${m.dosis} · Desde ${m.desde}</li>`).join('')}</ul>
      <h3>Consultas</h3>
      <ul class="list">
        ${(h.consultas || [])
          .map(
            (c) => `<li><strong>${c.fecha}</strong> · ${c.medico} · ${c.especialidad}<br />Motivo: ${c.motivo}<br />Diagnóstico: ${c.diagnostico}<br />Tratamiento: ${c.tratamiento}<br />Notas: ${c.notasEvolucion}</li>`
          )
          .join('')}
      </ul>
      <p><small>Última actualización: ${h.ultimaActualizacion} · Por: ${h.actualizadoPor}</small></p>
    </section>
  `;

  const pageMiHistoria = (user) => {
    const h = window.AmCareHistoria.findById(user.historiaId);
    if (!h) return '<section class="card"><p>No se encontró historia.</p></section>';
    return renderHistoryDetail(h, true);
  };

  const pageHistoriaMedica = (id, user) => {
    const h = window.AmCareHistoria.findById(id);
    if (!h) return '<section class="card"><p>Historia no encontrada.</p></section>';
    if (user?.rol === 'medico' && !(user.pacientesIds || []).includes(Number(id))) {
      return '<section class="card denied"><h2>Acceso denegado</h2><p>Solo puedes ver historias de tus pacientes asignados.</p><a class="btn btn-primary" href="#/mis-pacientes">Volver</a></section>';
    }

    return `
      ${renderHistoryDetail(h, false)}
      <section class="grid cols-2" style="margin-top:14px">
        <article class="card">
          <h3>Editar datos base</h3>
          <form id="editHistoriaForm">
            <input type="hidden" id="historiaIdEdit" value="${h.id}" />
            <div class="form-group"><label>Alergias (coma separadas)</label><input id="alergiasEdit" value="${h.alergias.join(', ')}" /></div>
            <div class="form-group"><label>Antecedentes familiares</label><input id="famEdit" value="${h.antecedentesFamiliares}" /></div>
            <div class="form-group"><label>Medicamento actual</label><input id="medActualEdit" value="${h.medicamentosActuales[0]?.nombre || ''}" /></div>
            <button class="btn btn-primary" type="submit">Guardar cambios</button>
          </form>
        </article>
        <article class="card">
          <h3>Registrar nueva consulta</h3>
          <form id="newConsultaForm">
            <input type="hidden" id="historiaIdConsulta" value="${h.id}" />
            <div class="form-group"><label>Especialidad</label><input id="consEspecialidad" value="Medicina General" /></div>
            <div class="form-group"><label>Tipo</label><select id="consTipo"><option>Videollamada</option><option>Chat</option></select></div>
            <div class="form-group"><label>Motivo</label><input id="consMotivo" required /></div>
            <div class="form-group"><label>Diagnóstico</label><input id="consDiag" required /></div>
            <div class="form-group"><label>Tratamiento</label><textarea id="consTrat" required></textarea></div>
            <div class="form-group"><label>Notas evolución</label><textarea id="consEvo"></textarea></div>
            <button class="btn btn-success" type="submit">Agregar consulta</button>
          </form>
        </article>
      </section>
    `;
  };

  const pageMisPacientes = (user) => {
    const historias = window.AmCareHistoria.getHistorias().filter((h) => (user.pacientesIds || []).includes(h.id));
    return `
      <section class="card">
        <h2>Mis pacientes</h2>
        <div class="form-group"><label>Buscar</label><input id="buscarPaciente" placeholder="Nombre del paciente" /></div>
        <ul class="list" id="listaPacientes">
          ${historias
            .map(
              (h) => `<li><div class="avatar-row"><img class="avatar" src="https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(h.pacienteNombre)}"/><div><strong>${h.pacienteNombre}</strong><br/><small>Historia #${h.id}</small></div></div><a class="btn btn-outline" href="#/historia/${h.id}">Abrir historia</a></li>`
            )
            .join('')}
        </ul>
      </section>
    `;
  };

  const pageMiAgenda = () => `
    <section class="grid cols-2">
      <article class="card">
        <h2>Mi agenda (FullCalendar)</h2>
        <p>Gestiona slots disponibles (verde), bloqueados (rojo) y vacaciones (gris).</p>
        <div id="calendarMain"></div>
      </article>
      <article class="card">
        <h3>Configuración</h3>
        <div class="form-group"><label>Duración consulta (min)</label><input value="30" /></div>
        <div class="form-group"><label>Días laborales</label><input value="Lunes a Viernes" /></div>
        <div class="form-group"><label>Horario de atención</label><input value="08:00 - 17:00" /></div>
        <p>Haz clic en el calendario para crear bloques.</p>
      </article>
    </section>
  `;

  const pagePanelPaciente = (user) => {
    const citas = getAppointments().filter((a) => a.historiaId === user.historiaId);
    const recetas = window.AmCareHistoria.getRecetas().filter((r) => r.historiaId === user.historiaId);
    const docs = window.AmCareHistoria.getDocumentos().filter((d) => d.historiaId === user.historiaId);

    return `
      <section class="grid cols-2">
        <article class="card">
          <h2>Dashboard del paciente</h2>
          <div class="kpis">
            <article class="kpi"><small>Citas próximas</small><strong>${citas.length}</strong></article>
            <article class="kpi"><small>Recetas</small><strong>${recetas.length}</strong></article>
            <article class="kpi"><small>Documentos</small><strong>${docs.length}</strong></article>
            <article class="kpi"><small>Estado</small><strong>Activo</strong></article>
          </div>
          <canvas id="patientChart" height="150"></canvas>
        </article>

        <article class="card">
          <h3>Mis citas</h3>
          <ul class="list">${citas.length ? citas.map((c) => `<li><strong>${fmtDateTime(c.fecha)}</strong> · ${c.tipo} · ${c.estado}<br/><small>${c.medico}</small><br/><div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-outline" data-join-appt="${c.id}">Entrar consulta</button>${c.estado !== 'Cancelada' ? `<button class="btn btn-danger" data-cancel-appt="${c.id}">Cancelar</button>` : ''}</div></li>`).join('') : '<li>Sin citas registradas</li>'}</ul>
        </article>
      </section>

      <section class="grid cols-2" style="margin-top:14px">
        <article class="card">
          <h3>Mis recetas</h3>
          <ul class="list">${recetas.map((r) => `<li>${r.medicamento} · ${r.dosis} · ${r.frecuencia} · ${new Date(r.fecha).toLocaleDateString()}</li>`).join('') || '<li>Sin recetas nuevas</li>'}</ul>
        </article>
        <article class="card">
          <h3>Mis documentos</h3>
          <ul class="list">${docs.map((d) => `<li>${d.nombre} · ${new Date(d.fecha).toLocaleDateString()} <button class="btn btn-outline">Descargar</button></li>`).join('') || '<li>Sin documentos</li>'}</ul>
        </article>
      </section>
    `;
  };

  const pagePanelMedico = (user) => {
    const historias = window.AmCareHistoria.getHistorias().filter((h) => (user.pacientesIds || []).includes(h.id));
    const citas = getAppointments().filter((c) => c.medico === user.nombre && c.estado !== 'Cancelada').slice(0, 8);
    return `
      <section class="grid cols-2">
        <article class="card">
          <h2>Panel médico</h2>
          <div class="kpis">
            <article class="kpi"><small>Pacientes asignados</small><strong>${historias.length}</strong></article>
            <article class="kpi"><small>Consultas hoy</small><strong>4</strong></article>
            <article class="kpi"><small>Videoconsultas</small><strong>3</strong></article>
            <article class="kpi"><small>Chats activos</small><strong>2</strong></article>
          </div>
          <canvas id="doctorChart" height="150"></canvas>
        </article>
        <article class="card">
          <h3>Pacientes recientes</h3>
          <ul class="list">${historias.map((h) => `<li>${h.pacienteNombre} · <a href="#/historia/${h.id}">Abrir historia</a></li>`).join('')}</ul>
        </article>
      </section>

      <section class="card" style="margin-top:14px">
        <h3>Citas programadas</h3>
        <ul class="list">
          ${citas.length
            ? citas
                .map(
                  (c) => `<li><strong>${fmtDateTime(c.fecha)}</strong> · ${c.paciente} · ${c.tipo}<br/><div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-outline" data-join-appt="${c.id}">Iniciar consulta</button><button class="btn btn-danger" data-cancel-appt="${c.id}">Cancelar</button></div></li>`
                )
                .join('')
            : '<li>Sin citas activas.</li>'}
        </ul>
      </section>
    `;
  };

  const pageAdmin = () => window.AmCareAdmin.renderPanel();

  const deniedPage = (user) => `
    <section class="card denied">
      <h2>${t('denied')}</h2>
      <p>No tienes permisos para abrir esta ruta.</p>
      <a class="btn btn-primary" href="${window.AmCareRoles.getDefaultPanel(user)}">${t('backPanel')}</a>
    </section>
  `;

  const bindCommonEvents = () => {
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => window.AmCareI18n.setLanguage(btn.getAttribute('data-lang')));
    });
    $('#logoutBtn')?.addEventListener('click', () => {
      window.AmCareRoles.logout();
      window.location.hash = '#/login';
    });
  };

  const bindLogin = () => {
    $('#loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = window.AmCareRoles.login($('#loginEmail').value.trim(), $('#loginPassword').value.trim());
      if (!u) return alert('Credenciales inválidas o usuario inactivo');
      window.location.hash = window.AmCareRoles.getDefaultPanel(u);
    });

    document.querySelectorAll('[data-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-quick');
        const users = window.AmCareRoles.getUsers();
        const u = users.find((x) => x.rol === role && x.activo !== false);
        if (!u) return alert('No se encontró usuario demo');

        $('#loginEmail').value = u.email;
        $('#loginPassword').value = u.password;
        $('#loginPassword').focus();
      });
    });
  };

  const bindBuscar = () => {
    $('#applyDoctorFilter')?.addEventListener('click', () => {
      const term = ($('#medicoFilter').value || '').toLowerCase();
      const idioma = $('#idiomaFilter').value;
      const medicos = JSON.parse(localStorage.getItem('amcare-medicos') || '[]');
      const filtered = medicos.filter((m) => {
        const okTerm = !term || m.nombre.toLowerCase().includes(term) || m.especialidad.toLowerCase().includes(term);
        const okLang = !idioma || m.idioma.includes(idioma);
        return okTerm && okLang;
      });
      $('#doctorList').innerHTML = filtered
        .map(
          (m) => `<article class="card"><div class="avatar-row"><img class="avatar" src="https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(m.nombre)}"/><div><strong>${m.nombre}</strong><br/><small>${m.especialidad} · ⭐ ${m.rating}</small></div></div><p>Idiomas: ${m.idioma}</p><a class="btn btn-outline" href="#/perfil?medico=${m.id}">Ver perfil</a></article>`
        )
        .join('');
    });
  };

  const bindAgendar = (user) => {
    $('#agendarForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!user) return alert('Debes iniciar sesión');
      const fecha = $('#fechaConsulta').value;
      const now = new Date();
      const dt = new Date(fecha);
      if (!fecha || Number.isNaN(dt.getTime()) || dt < now) return alert('Selecciona una fecha y hora válida en el futuro.');

      const medicos = getMedicos();
      const medicoId = Number($('#medicoConsulta').value);
      const medicoSel = medicos.find((m) => m.id === medicoId) || medicos[0];
      if (!medicoSel) return alert('No hay médicos disponibles en este momento.');

      localStorage.setItem('amcare-selected-medico-id', String(medicoSel.id));

      const roomName = `AmCare-${medicoSel.nombre.replace(/\s+/g, '')}-${Date.now()}`;
      const citas = getAppointments();
      const cita = {
        id: `a-${Date.now()}`,
        historiaId: user.historiaId || 101,
        paciente: user.nombre,
        medico: medicoSel.nombre,
        tipo: $('#tipoConsulta').value,
        fecha,
        motivo: $('#motivoConsulta').value,
        estado: 'Confirmada',
        roomName
      };
      citas.unshift(cita);
      setAppointments(citas);

      const events = window.AmCareAgenda.getEvents();
      const start = new Date(fecha);
      const end = new Date(start.getTime() + 30 * 60000);
      events.push({
        id: `evt-${cita.id}`,
        title: cita.paciente,
        start: start.toISOString(),
        end: end.toISOString(),
        color: '#166534',
        estado: 'cita',
        tipo: cita.tipo
      });
      window.AmCareAgenda.setEvents(events);

      localStorage.setItem('amcare-next-room', roomName);
      localStorage.setItem('amcare-next-doctor', medicoSel.nombre.replace(/\s+/g, ''));

      alert('¡Cita confirmada!');
      window.location.hash = window.AmCareRoles.getDefaultPanel(user);
    });

    window.AmCareAgenda.renderCalendar('calendarPatient', { role: 'paciente' });
  };

  const bindConsulta = (user) => {
    const startCall = (roomOverride) => {
      const doctor = ($('#jitsiDoctor').value || 'Doctor').replace(/\s+/g, '');
      const room = roomOverride || localStorage.getItem('amcare-next-room') || `AmCare-${doctor}-${Date.now()}`;
      const waitingArea = $('#waitingArea');
      const countdown = $('#countdown');
      const container = $('#jitsi-container');

      waitingArea.style.display = 'block';
      container.style.display = 'none';
      let sec = 5;
      countdown.textContent = sec;

      clearInterval(state.waitingTimer);
      state.waitingTimer = setInterval(() => {
        sec -= 1;
        countdown.textContent = sec;
        if (sec <= 0) {
          clearInterval(state.waitingTimer);
          waitingArea.style.display = 'none';
          container.style.display = 'block';
          if (state.jitsiApi) state.jitsiApi.dispose();
          state.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
            roomName: room,
            parentNode: container,
            width: '100%',
            height: 540,
            userInfo: { displayName: user?.nombre || 'Invitado' }
          });
        }
      }, 1000);
    };

    $('#startVideoCall')?.addEventListener('click', () => startCall());
    document.querySelectorAll('[data-open-room]').forEach((btn) => {
      btn.addEventListener('click', () => startCall(btn.getAttribute('data-open-room')));
    });

    $('#leaveCall')?.addEventListener('click', () => {
      if (state.jitsiApi) {
        state.jitsiApi.dispose();
        state.jitsiApi = null;
      }
      $('#jitsi-container').style.display = 'none';
      $('#waitingArea').style.display = 'none';
    });

    $('#attachConsultaDoc')?.addEventListener('click', () => {
      const f = $('#consultaDoc').files?.[0];
      if (!f) return alert('Selecciona un archivo');
      const historiaId = user?.historiaId || 101;
      window.AmCareHistoria.addDocumento(historiaId, f.name, user?.nombre || 'Consulta');
      alert(`Documento ${f.name} adjuntado (simulado).`);
    });

    $('#rxForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const historiaId = Number($('#rxHistoriaId').value);
      const receta = {
        medicamento: $('#rxMedicamento').value,
        dosis: $('#rxDosis').value,
        frecuencia: $('#rxFrecuencia').value,
        duracion: $('#rxDuracion').value,
        observaciones: $('#rxObs').value
      };
      const rx = window.AmCareHistoria.addRecetaToHistoria(historiaId, receta, user.nombre);
      if (!rx) return alert('Historia inválida');

      $('#rxPrintCard').innerHTML = `
        <div class="card">
          <h4>Receta electrónica</h4>
          <p><strong>Paciente:</strong> ${rx.pacienteNombre}</p>
          <p><strong>Medicamento:</strong> ${rx.medicamento}</p>
          <p><strong>Dosis:</strong> ${rx.dosis}</p>
          <p><strong>Frecuencia:</strong> ${rx.frecuencia}</p>
          <p><strong>Duración:</strong> ${rx.duracion}</p>
          <p><strong>Observaciones:</strong> ${rx.observaciones || '-'}</p>
          <button class="btn btn-outline" id="printRxBtn">Imprimir</button>
        </div>
      `;
      $('#printRxBtn').addEventListener('click', () => window.print());
    });
  };

  const bindChat = (user) => {
    document.querySelectorAll('[data-open-chat]').forEach((item) => {
      item.addEventListener('click', () => {
        state.selectedConversationId = item.getAttribute('data-open-chat');
        rerender();
      });
    });

    const sendMessage = () => {
      const txt = ($('#chatInput').value || '').trim();
      const conversations = JSON.parse(localStorage.getItem('amcare-conversations') || '[]');
      if (!state.selectedConversationId && conversations[0]) state.selectedConversationId = conversations[0].id;
      const idx = conversations.findIndex((c) => c.id === state.selectedConversationId);
      if (idx < 0) return;
      const now = new Date().toLocaleString();
      const f = $('#chatFile')?.files?.[0];
      if (!txt && !f) return;
      if (txt) {
        conversations[idx].messages.push({ by: user.rol === 'paciente' ? 'paciente' : 'medico', text: txt, at: now });
      }
      if (f) {
        conversations[idx].messages.push({ by: user.rol === 'paciente' ? 'paciente' : 'medico', text: `📎 Documento adjunto: ${f.name}`, at: now });
        const historiaId = conversations[idx].historiaId;
        window.AmCareHistoria.addDocumento(historiaId, f.name, user.nombre);
      }
      localStorage.setItem('amcare-conversations', JSON.stringify(conversations));
      rerender();
    };

    $('#sendMsg')?.addEventListener('click', sendMessage);
    $('#chatInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  };

  const bindAppointmentActions = () => {
    const tryJoinAppointment = (apptId) => {
      const appt = getAppointments().find((a) => a.id === apptId && a.estado !== 'Cancelada');
      if (!appt) return alert('La cita no está disponible.');
      localStorage.setItem('amcare-next-room', appt.roomName || '');
      localStorage.setItem('amcare-next-doctor', (appt.medico || '').replace(/\s+/g, ''));
      window.location.hash = '#/consulta';
    };

    const cancelAppointment = (apptId) => {
      const appointments = getAppointments();
      const idx = appointments.findIndex((a) => a.id === apptId);
      if (idx < 0) return;
      appointments[idx].estado = 'Cancelada';
      setAppointments(appointments);
      rerender();
    };

    document.querySelectorAll('[data-join-appt]').forEach((btn) => {
      btn.addEventListener('click', () => tryJoinAppointment(btn.getAttribute('data-join-appt')));
    });
    document.querySelectorAll('[data-cancel-appt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('¿Seguro que deseas cancelar esta cita?')) cancelAppointment(btn.getAttribute('data-cancel-appt'));
      });
    });
  };

  const bindHistoriaMedica = (user) => {
    $('#editHistoriaForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = Number($('#historiaIdEdit').value);
      const updated = window.AmCareHistoria.updateHistoria(
        id,
        {
          alergias: ($('#alergiasEdit').value || '').split(',').map((x) => x.trim()).filter(Boolean),
          antecedentesFamiliares: $('#famEdit').value,
          medicamentosActuales: [{ nombre: $('#medActualEdit').value, dosis: 'Según indicación', desde: new Date().toISOString().slice(0, 10) }]
        },
        user.nombre
      );
      if (!updated) return alert('No se pudo guardar');
      alert('Historia actualizada');
      rerender();
    });

    $('#newConsultaForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const historiaId = Number($('#historiaIdConsulta').value);
      const ok = window.AmCareHistoria.addConsulta(
        historiaId,
        {
          medico: user.nombre,
          especialidad: $('#consEspecialidad').value,
          tipo: $('#consTipo').value,
          motivo: $('#consMotivo').value,
          diagnostico: $('#consDiag').value,
          tratamiento: $('#consTrat').value,
          notasEvolucion: $('#consEvo').value,
          receta: null,
          documentosAdjuntos: []
        },
        user.nombre
      );
      if (!ok) return alert('No se pudo agregar consulta');
      alert('Consulta añadida.');
      rerender();
    });
  };

  const bindMisPacientes = () => {
    $('#buscarPaciente')?.addEventListener('input', (e) => {
      const term = (e.target.value || '').toLowerCase();
      document.querySelectorAll('#listaPacientes li').forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  };

  const renderCharts = (route, user) => {
    const patientCtx = document.getElementById('patientChart');
    if (patientCtx && window.Chart) {
      new Chart(patientCtx, {
        type: 'bar',
        data: { labels: ['Ene', 'Feb', 'Mar', 'Abr'], datasets: [{ label: 'Consultas', data: [1, 2, 1, 3], backgroundColor: '#166534' }] },
        options: { plugins: { legend: { display: false } } }
      });
    }

    const docCtx = document.getElementById('doctorChart');
    if (docCtx && window.Chart) {
      new Chart(docCtx, {
        type: 'line',
        data: { labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], datasets: [{ label: 'Atenciones', data: [5, 4, 6, 3, 7], borderColor: '#16a34a', fill: false }] }
      });
    }

    const plansCtx = document.getElementById('plansChart');
    if (plansCtx && window.Chart) {
      new Chart(plansCtx, {
        type: 'radar',
        data: {
          labels: ['Chat', 'Video', 'Recetas', 'Analítica', 'Integración'],
          datasets: [
            { label: 'Personal', data: [5, 5, 5, 4, 2], borderColor: '#166534' },
            { label: 'Hospital', data: [5, 5, 5, 5, 5], borderColor: '#ea580c' }
          ]
        }
      });
    }
  };

  const renderLeaflet = () => {
    const mapDiv = document.getElementById('clinicMap');
    if (!mapDiv || !window.L) return;
    const map = L.map('clinicMap').setView([4.711, -74.0721], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    [
      { name: 'Bogotá', lat: 4.711, lng: -74.0721 },
      { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 },
      { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 }
    ].forEach((p) => L.marker([p.lat, p.lng]).addTo(map).bindPopup(`AmCare ${p.name}`));
  };

  const bindRoutePage = (route, user, query) => {
    if (route === '/login') bindLogin();
    if (route === '/buscar') bindBuscar();
    if (route === '/perfil') window.AmCareAgenda.renderCalendar('calendarProfile', { role: 'paciente' });
    if (route === '/agendar') bindAgendar(user);
    if (route === '/consulta') bindConsulta(user);
    if (route === '/chat') bindChat(user);
    if (route.startsWith('/historia/')) bindHistoriaMedica(user);
    if (route === '/mis-pacientes') bindMisPacientes();
    if (route === '/mi-agenda') {
      window.AmCareAgenda.renderCalendar('calendarMain', {
        role: user?.rol === 'medico' ? 'medico' : 'paciente',
        onStartConsultation: () => {
          if (confirm('Abrir consulta ahora?')) window.location.hash = '#/consulta';
        }
      });
    }
    if (route === '/admin') window.AmCareAdmin.bindPanelEvents();
    if (route === '/casos-de-uso') setTimeout(renderLeaflet, 50);
    if (['/agendar', '/panel', '/panel-medico'].includes(route)) bindAppointmentActions();
    renderCharts(route, user);
  };

  const renderRoute = () => {
    const rawUser = window.AmCareRoles.refreshCurrentUser();
    const { route, query } = getRouteState();

    if (!rawUser && route !== '/login') {
      window.location.hash = '#/login';
      return;
    }

    const allow = window.AmCareRoles.routeAllows(route, rawUser);
    if (!allow) {
      renderShell(route, rawUser, deniedPage(rawUser));
      return;
    }

    let page = '';
    if (route === '/') page = pageHome();
    else if (route === '/login') page = pageLogin();
    else if (route === '/buscar') page = pageBuscar();
  else if (route === '/perfil') page = pagePerfil(query);
  else if (route === '/agendar') page = pageAgendar(rawUser, query);
    else if (route === '/consulta') page = pageConsulta(rawUser);
    else if (route === '/chat') page = pageChat(rawUser);
    else if (route === '/urgencias') page = pageUrgencias();
    else if (route === '/planes') page = pagePlanes();
    else if (route === '/casos-de-uso') page = pageCasosUso();
    else if (route === '/seguridad') page = pageSeguridad();
    else if (route === '/ayuda') page = pageAyuda();
    else if (route === '/mi-historia') page = pageMiHistoria(rawUser);
  else if (route.startsWith('/historia/')) page = pageHistoriaMedica(route.split('/')[2], rawUser);
    else if (route === '/mis-pacientes') page = pageMisPacientes(rawUser);
    else if (route === '/mi-agenda') page = pageMiAgenda();
    else if (route === '/panel') page = pagePanelPaciente(rawUser);
    else if (route === '/panel-medico') page = pagePanelMedico(rawUser);
    else if (route === '/admin' || route === '/admin/historias') page = pageAdmin();
    else page = '<section class="card"><h2>Ruta no encontrada</h2><a href="#/" class="btn btn-outline">Ir al inicio</a></section>';

    renderShell(route, rawUser, page);
    bindRoutePage(route, rawUser, query);
  };

  const rerender = () => renderRoute();

  const boot = async () => {
    await window.AmCareI18n.init();
    initData();
    renderRoute();
    window.addEventListener('hashchange', renderRoute);
  };

  return { boot, rerender };
})();

window.addEventListener('DOMContentLoaded', () => window.AmCareApp.boot());