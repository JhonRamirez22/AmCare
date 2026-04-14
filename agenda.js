window.AmCareAgenda = (() => {
  const KEY = 'amcare-agenda-events';

  const safeParse = (raw, fallback) => {
    try {
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const getEvents = () => {
    const parsed = safeParse(localStorage.getItem(KEY) || '[]', []);
    return Array.isArray(parsed) ? parsed : [];
  };
  const setEvents = (events) => localStorage.setItem(KEY, JSON.stringify(events));

  const initAgendaDefaults = () => {
    const current = getEvents();
    if (current.length) return;

    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    setEvents([
      { id: `e1`, title: 'Disponible', start: `${date}T09:00:00`, end: `${date}T09:30:00`, color: '#16a34a', estado: 'disponible' },
      { id: `e2`, title: 'Disponible', start: `${date}T10:00:00`, end: `${date}T10:30:00`, color: '#16a34a', estado: 'disponible' },
  { id: `e3`, title: 'Juan Pérez', start: `${date}T11:00:00`, end: `${date}T11:30:00`, color: '#166534', estado: 'cita', tipo: 'Videollamada' },
      { id: `e4`, title: 'Bloqueado', start: `${date}T14:00:00`, end: `${date}T14:30:00`, color: '#dc2626', estado: 'bloqueado' }
    ]);
  };

  const renderCalendar = (elementId, options = {}) => {
    const target = document.getElementById(elementId);
    if (!target || typeof FullCalendar === 'undefined') return null;

    const { role = 'paciente', onStartConsultation } = options;
    const cal = new FullCalendar.Calendar(target, {
      initialView: 'timeGridWeek',
      locale: 'es',
      slotMinTime: '07:00:00',
      slotMaxTime: '20:00:00',
      height: 'auto',
      events: getEvents(),
      dateClick: (info) => {
        if (role !== 'medico') return;
        const estado = prompt('Estado del slot (disponible/bloqueado/vacaciones):', 'disponible');
        if (!estado) return;

        const colorMap = { disponible: '#16a34a', bloqueado: '#dc2626', vacaciones: '#64748b' };
        const titleMap = { disponible: 'Disponible', bloqueado: 'Bloqueado', vacaciones: 'Vacaciones' };
        const start = new Date(info.date);
        const end = new Date(start.getTime() + 30 * 60000);

        const events = getEvents();
        events.push({
          id: `e${Date.now()}`,
          title: titleMap[estado] || 'Disponible',
          start: start.toISOString(),
          end: end.toISOString(),
          color: colorMap[estado] || '#16a34a',
          estado
        });
        setEvents(events);
        cal.refetchEvents();
      },
      eventClick: (info) => {
        const e = info.event;
        if (role === 'paciente') {
          if (e.extendedProps.estado !== 'disponible') return;
          alert('Franja seleccionada. Continúa en Agendar para confirmar.');
          window.location.hash = '#/agendar';
          return;
        }

        const estado = e.extendedProps.estado;
        if (estado === 'cita' && onStartConsultation) {
          onStartConsultation(e);
        } else if (role === 'medico') {
          if (confirm(`¿Eliminar slot/cita ${e.title}?`)) {
            const events = getEvents().filter((ev) => ev.id !== e.id);
            setEvents(events);
            e.remove();
          }
        }
      }
    });

    cal.render();
    return cal;
  };

  return { initAgendaDefaults, getEvents, setEvents, renderCalendar };
})();