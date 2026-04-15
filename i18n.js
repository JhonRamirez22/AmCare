window.AmCareI18n = (() => {
  const resources = {
    es: {
      translation: {
        appName: 'Mediwell',
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
  patientPanel: 'Panel paciente',
  doctorPanel: 'Panel médico',
        admin: 'Admin',
        heroTitle: 'Atención médica digital confiable para Colombia y LATAM',
        heroText: 'Agenda, consulta por videollamada, chatea con tu médico y administra tu historia clínica en una sola plataforma.',
        quickConsult: 'Consulta en 2 clics',
        startNow: 'Agendar ahora',
        seePlans: 'Ver planes',
  whyAmcare: '¿Por qué Mediwell?',
  footerWorks: 'Funciona en cualquier dispositivo con internet',
  footerSsl: 'Cifrado SSL/TLS',
  footerConfidential: 'Datos confidenciales',
  importantNotice: 'Aviso importante:',
        limitationsTitle: 'Consideraciones importantes',
        denied: 'Acceso denegado',
        backPanel: 'Volver al panel'
      }
    },
    en: {
      translation: {
        appName: 'Mediwell',
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
  patientPanel: 'Patient dashboard',
  doctorPanel: 'Doctor dashboard',
        admin: 'Admin',
        heroTitle: 'Trusted digital healthcare for Colombia and LATAM',
        heroText: 'Schedule, video consult, chat with your doctor, and manage your health record in a single platform.',
        quickConsult: 'Consult in 2 clicks',
        startNow: 'Schedule now',
        seePlans: 'View plans',
  whyAmcare: 'Why Mediwell?',
  footerWorks: 'Works on any internet-enabled device',
  footerSsl: 'SSL/TLS encryption',
  footerConfidential: 'Confidential data',
  importantNotice: 'Important notice:',
        limitationsTitle: 'Important considerations',
        denied: 'Access denied',
        backPanel: 'Back to dashboard'
      }
    },
    he: {
      translation: {
        appName: 'Mediwell',
        appSubtitle: 'שירותי בריאות מכל מקום',
        hipaa: 'תואם HIPAA',
        login: 'התחברות',
        logout: 'התנתקות',
        home: 'בית',
        findDoctors: 'חיפוש רופאים',
        plans: 'תוכניות',
        useCases: 'מקרי שימוש',
        security: 'אבטחה',
        help: 'עזרה',
        chat: 'צ׳אט',
        schedule: 'קביעת תור',
        consultation: 'ייעוץ',
        emergency: 'דחוף',
        myHistory: 'התיק שלי',
        myAgenda: 'הלו״ז שלי',
        myPatients: 'המטופלים שלי',
        panel: 'לוח בקרה',
        patientPanel: 'לוח מטופל',
        doctorPanel: 'לוח רופא',
        admin: 'מנהל',
        heroTitle: 'בריאות דיגיטלית אמינה עבור ארה״ב וישראל',
        heroText: 'קבעו תור, בצעו שיחת וידאו, שוחחו עם רופא ונהלו תיק רפואי בפלטפורמה אחת.',
        quickConsult: 'ייעוץ ב-2 קליקים',
        startNow: 'קבעו עכשיו',
        seePlans: 'צפו בתוכניות',
        whyAmcare: 'למה Mediwell?',
        footerWorks: 'עובד על כל מכשיר עם אינטרנט',
        footerSsl: 'הצפנת SSL/TLS',
        footerConfidential: 'מידע חסוי',
        importantNotice: 'הודעה חשובה:',
        limitationsTitle: 'נקודות חשובות',
        denied: 'הגישה נדחתה',
        backPanel: 'חזרה ללוח הבקרה'
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