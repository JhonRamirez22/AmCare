window.AmCareI18n = (() => {
  const resources = {
    es: {
      translation: {
        appName: 'AmCare',
        appSubtitle: 'Atención médica desde cualquier lugar',
        hipaa: 'HIPAA Compliant',
        login: 'Ingresar',
        logout: 'Cerrar sesión',
        home: 'Inicio',
        findDoctors: 'Buscar médicos',
        plans: 'Planes',
        useCases: 'Casos de uso',
        security: 'Seguridad',
        help: 'Ayuda',
        chat: 'Chat',
        schedule: 'Agendar',
        consultation: 'Consulta',
        emergency: 'Urgencias',
        myHistory: 'Mi historia',
        myAgenda: 'Mi agenda',
        myPatients: 'Mis pacientes',
        panel: 'Panel',
        admin: 'Admin',
        heroTitle: 'Atención médica digital confiable para Colombia y LATAM',
        heroText: 'Agenda, consulta por videollamada, chatea con tu médico y administra tu historia clínica en una sola plataforma.',
        quickConsult: 'Consulta en 2 clics',
        startNow: 'Agendar ahora',
        seePlans: 'Ver planes',
        whyAmcare: '¿Por qué AmCare?',
        limitationsTitle: 'Consideraciones importantes',
        denied: 'Acceso denegado',
        backPanel: 'Volver al panel'
      }
    },
    en: {
      translation: {
        appName: 'AmCare',
        appSubtitle: 'Healthcare from anywhere',
        hipaa: 'HIPAA Compliant',
        login: 'Log in',
        logout: 'Log out',
        home: 'Home',
        findDoctors: 'Find doctors',
        plans: 'Plans',
        useCases: 'Use cases',
        security: 'Security',
        help: 'Help',
        chat: 'Chat',
        schedule: 'Schedule',
        consultation: 'Consultation',
        emergency: 'Urgent care',
        myHistory: 'My record',
        myAgenda: 'My schedule',
        myPatients: 'My patients',
        panel: 'Dashboard',
        admin: 'Admin',
        heroTitle: 'Trusted digital healthcare for Colombia and LATAM',
        heroText: 'Schedule, video consult, chat with your doctor, and manage your health record in a single platform.',
        quickConsult: 'Consult in 2 clicks',
        startNow: 'Schedule now',
        seePlans: 'View plans',
        whyAmcare: 'Why AmCare?',
        limitationsTitle: 'Important considerations',
        denied: 'Access denied',
        backPanel: 'Back to dashboard'
      }
    }
  };

  const init = async () => {
    const preferred = localStorage.getItem('amcare-lang') || 'es';
    await i18next.init({ resources, lng: preferred, fallbackLng: 'es' });
  };

  const setLanguage = (lng) => {
    i18next.changeLanguage(lng);
    localStorage.setItem('amcare-lang', lng);
    if (window.AmCareApp?.rerender) window.AmCareApp.rerender();
  };

  const t = (key) => i18next.t(key);

  return { init, setLanguage, t };
})();