window.AmCareRoles = (() => {
  const SESSION_KEY = 'amcare-current-user';

  const safeParse = (raw, fallback) => {
    try {
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const ROLE_LABEL = {
    paciente: 'Paciente',
    medico: 'Médico',
    admin: 'Admin'
  };

  const getUsers = () => {
    const parsed = safeParse(localStorage.getItem('amcare-users') || '[]', []);
    return Array.isArray(parsed) ? parsed : [];
  };
  const setUsers = (users) => localStorage.setItem('amcare-users', JSON.stringify(users));

  const getCurrentUser = () => safeParse(localStorage.getItem(SESSION_KEY) || 'null', null);
  const setCurrentUser = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  const logout = () => localStorage.removeItem(SESSION_KEY);

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password && u.activo !== false);
    if (!found) return null;
    setCurrentUser(found);
    return found;
  };

  const loginAsRole = (role) => {
    const users = getUsers();
    const found = users.find((u) => u.rol === role && u.activo !== false);
    if (!found) return null;
    setCurrentUser(found);
    return found;
  };

  const refreshCurrentUser = () => {
    const current = getCurrentUser();
    if (!current) return null;
    const users = getUsers();
    const user = users.find((u) => u.id === current.id && u.activo !== false);
    if (!user) {
      logout();
      return null;
    }
    setCurrentUser(user);
    return user;
  };

  const routeAllows = (route, user) => {
    if (!user) return route === '/login';

    if (route === '/login') return true;

    const commonRoutes = new Set(['/', '/planes', '/casos-de-uso', '/seguridad', '/ayuda', '/urgencias']);
    if (commonRoutes.has(route)) return true;

    if (user.rol === 'paciente') {
      return ['/panel', '/mi-historia', '/agendar', '/chat', '/consulta', '/buscar', '/perfil'].includes(route);
    }

    if (user.rol === 'medico') {
      if (route.startsWith('/historia/')) return true;
      return ['/panel-medico', '/mi-agenda', '/mis-pacientes', '/chat', '/consulta'].includes(route);
    }

    if (user.rol === 'admin') {
      return ['/admin', '/admin/historias'].includes(route);
    }

    return false;
  };

  const roleBadgeClass = (role) => {
    if (role === 'paciente') return 'badge-role-paciente';
    if (role === 'medico') return 'badge-role-medico';
    return 'badge-role-admin';
  };

  const getDefaultPanel = (user) => {
    if (!user) return '#/login';
    if (user.rol === 'paciente') return '#/panel';
    if (user.rol === 'medico') return '#/panel-medico';
    return '#/admin';
  };

  return {
    ROLE_LABEL,
    getUsers,
    setUsers,
    login,
    loginAsRole,
    logout,
    getCurrentUser,
    refreshCurrentUser,
    routeAllows,
    roleBadgeClass,
    getDefaultPanel,
    setCurrentUser
  };
})();