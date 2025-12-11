// =====================================================
// COMPONENTE: LEYENDA DE FILTROS
// =====================================================

import { ROOM_FILTERS } from '$/utils/constants.js';

/**
 * Renderiza la leyenda de filtros como botones
 * @param {HTMLElement} container - Contenedor donde renderizar los filtros
 * @param {string} currentFilter - Filtro actualmente seleccionado
 * @param {Function} onFilterChange - Callback cuando cambia el filtro
 */
export function renderFilterLegend(container, currentFilter, onFilterChange) {
  if (!container) return;

  container.innerHTML = '';

  const filters = [
    { key: ROOM_FILTERS.ALL, label: 'Todas', icon: 'grid-3x2-gap' },
    { key: ROOM_FILTERS.ASSIGNED, label: 'Asignadas a mí', icon: 'person-check', dot: 'seat-green' },
    { key: ROOM_FILTERS.DIRTY, label: 'Sucias', icon: 'exclamation-circle', dot: 'seat-blue' },
    { key: ROOM_FILTERS.CLEAN, label: 'Limpias', icon: 'check-circle', dot: 'seat-gray' },
    { key: ROOM_FILTERS.BLOCKED, label: 'Siniestro', icon: 'exclamation-triangle', dot: 'seat-red' },
  ];

  filters.forEach(({ key, label, icon, dot }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    if (key === currentFilter) btn.classList.add('active');

    let html = `<i class="bi bi-${icon}"></i> ${label}`;
    if (dot) html = `<span class="legend-dot ${dot}"></span> ${label}`;
    btn.innerHTML = html;

    btn.addEventListener('click', () => {
      // Remover clase active de todos los botones
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      // Agregar clase active al botón clickeado
      btn.classList.add('active');
      // Llamar al callback con el nuevo filtro
      onFilterChange(key);
    });

    container.appendChild(btn);
  });
}
