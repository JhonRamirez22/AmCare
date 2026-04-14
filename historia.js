window.AmCareHistoria = (() => {
  const KEY = 'amcare-historias';

  const safeParse = (raw, fallback) => {
    try {
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const getHistorias = () => {
    const parsed = safeParse(localStorage.getItem(KEY) || '[]', []);
    return Array.isArray(parsed) ? parsed : [];
  };
  const setHistorias = (historias) => localStorage.setItem(KEY, JSON.stringify(historias));

  const findById = (id) => getHistorias().find((h) => h.id === Number(id));

  const updateHistoria = (id, patch, medicoNombre) => {
    const historias = getHistorias();
    const idx = historias.findIndex((h) => h.id === Number(id));
    if (idx < 0) return null;

    historias[idx] = {
      ...historias[idx],
      ...patch,
      ultimaActualizacion: new Date().toISOString().slice(0, 10),
      actualizadoPor: medicoNombre
    };
    setHistorias(historias);
    return historias[idx];
  };

  const addConsulta = (historiaId, consulta, medicoNombre) => {
    const historia = findById(historiaId);
    if (!historia) return null;
    const consultas = historia.consultas || [];
    consultas.unshift({
      id: `c${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 10),
      ...consulta
    });
    return updateHistoria(historiaId, { consultas }, medicoNombre);
  };

  const addRecetaToHistoria = (historiaId, receta, medicoNombre) => {
    const historia = findById(historiaId);
    if (!historia) return null;
  const recetasRaw = safeParse(localStorage.getItem('amcare-recetas') || '[]', []);
  const recetas = Array.isArray(recetasRaw) ? recetasRaw : [];
    recetas.unshift({
      id: `rx-${Date.now()}`,
      historiaId: Number(historiaId),
      pacienteNombre: historia.pacienteNombre,
      medico: medicoNombre,
      fecha: new Date().toISOString(),
      ...receta
    });
    localStorage.setItem('amcare-recetas', JSON.stringify(recetas));
    return recetas[0];
  };

  const addDocumento = (historiaId, fileName, origen) => {
  const docsRaw = safeParse(localStorage.getItem('amcare-documentos') || '[]', []);
  const docs = Array.isArray(docsRaw) ? docsRaw : [];
    docs.unshift({
      id: `doc-${Date.now()}`,
      historiaId: Number(historiaId),
      nombre: fileName,
      fecha: new Date().toISOString(),
      origen
    });
    localStorage.setItem('amcare-documentos', JSON.stringify(docs));

    const historia = findById(historiaId);
    if (historia) {
      const consultas = historia.consultas || [];
      if (consultas[0]) {
        consultas[0].documentosAdjuntos = consultas[0].documentosAdjuntos || [];
        consultas[0].documentosAdjuntos.push(fileName);
        updateHistoria(historiaId, { consultas }, origen);
      }
    }

    return docs[0];
  };

  const getRecetas = () => {
    const parsed = safeParse(localStorage.getItem('amcare-recetas') || '[]', []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const getDocumentos = () => {
    const parsed = safeParse(localStorage.getItem('amcare-documentos') || '[]', []);
    return Array.isArray(parsed) ? parsed : [];
  };

  return {
    getHistorias,
    setHistorias,
    findById,
    updateHistoria,
    addConsulta,
    addRecetaToHistoria,
    addDocumento,
    getRecetas,
    getDocumentos
  };
})();