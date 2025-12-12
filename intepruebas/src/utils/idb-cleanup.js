/**
 * Utilidades para mantener limpia la base de datos IndexedDB
 */

import { getAll, del, put } from '../idb.js';

/**
 * Limpia reportes duplicados en IndexedDB
 * Los reportes pueden tener duplicados por tener un _id local y un id del API
 */
export async function cleanDuplicateReports() {
  try {
    const allReports = await getAll('reports').catch(() => []) || [];
    const reportsById = new Map();

    // Agrupar por id real del API (no _id temporal)
    for (const report of allReports) {
      const apiId = report.id; // ID del API
      if (apiId) {
        if (!reportsById.has(apiId)) {
          reportsById.set(apiId, []);
        }
        reportsById.get(apiId).push(report);
      }
    }

    let duplicatesRemoved = 0;
    for (const [apiId, reportGroup] of reportsById.entries()) {
      if (reportGroup.length > 1) {
        // Mantener el que tiene _synced: true o el más reciente
        reportGroup.sort((a, b) => {
          if (a._synced && !b._synced) return -1;
          if (!a._synced && b._synced) return 1;

          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Más reciente primero
        });

        const toKeep = reportGroup[0];

        // Eliminar duplicados
        for (let i = 1; i < reportGroup.length; i++) {
          await del('reports', reportGroup[i]._id);
          duplicatesRemoved++;
          console.log(`[Cleanup] Reporte duplicado eliminado: ${reportGroup[i]._id}`);
        }
      }
    }

    if (duplicatesRemoved > 0) {
      console.log(`[Cleanup] ${duplicatesRemoved} reportes duplicados eliminados`);
    }

    return duplicatesRemoved;
  } catch (error) {
    console.error('[Cleanup] Error al limpiar reportes duplicados:', error);
    return 0;
  }
}

/**
 * Limpia operaciones del outbox que ya fueron sincronizadas exitosamente
 * Esta función es redundante ya que el outbox se limpia automáticamente al sincronizar,
 * pero sirve como medida de seguridad
 */
export async function cleanSyncedOutbox() {
  try {
    const outboxItems = await getAll('outbox').catch(() => []) || [];
    const syncedItems = outboxItems.filter(item => item._synced === true);

    for (const item of syncedItems) {
      await del('outbox', item._id);
      console.log(`[Cleanup] Operación sincronizada eliminada del outbox: ${item._id}`);
    }

    if (syncedItems.length > 0) {
      console.log(`[Cleanup] ${syncedItems.length} operaciones sincronizadas eliminadas del outbox`);
    }

    return syncedItems.length;
  } catch (error) {
    console.error('[Cleanup] Error al limpiar outbox:', error);
    return 0;
  }
}

/**
 * Limpia reportes muy antiguos (más de 30 días) para evitar acumulación
 * Solo elimina reportes que ya están sincronizados (_synced: true)
 */
export async function cleanOldReports(daysOld = 30) {
  try {
    const allReports = await getAll('reports').catch(() => []) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let oldReportsRemoved = 0;

    for (const report of allReports) {
      // Solo eliminar si está sincronizado y es antiguo
      if (report._synced && report.createdAt) {
        const reportDate = new Date(report.createdAt);
        if (reportDate < cutoffDate) {
          await del('reports', report._id);
          oldReportsRemoved++;
          console.log(`[Cleanup] Reporte antiguo eliminado: ${report._id} (${report.createdAt})`);
        }
      }
    }

    if (oldReportsRemoved > 0) {
      console.log(`[Cleanup] ${oldReportsRemoved} reportes antiguos eliminados`);
    }

    return oldReportsRemoved;
  } catch (error) {
    console.error('[Cleanup] Error al limpiar reportes antiguos:', error);
    return 0;
  }
}

/**
 * Limpia datos huérfanos (reportes/asignaciones de habitaciones o camareras que ya no existen)
 */
export async function cleanOrphanedData() {
  try {
    let orphansRemoved = 0;

    // Obtener todos los datos
    const [allRooms, allMaids, allReports] = await Promise.all([
      getAll('rooms').catch(() => []) || [],
      getAll('maids').catch(() => []) || [],
      getAll('reports').catch(() => []) || []
    ]);

    // Crear mapas de IDs válidos
    const validRoomIds = new Set(allRooms.map(r => r.id));
    const validMaidIds = new Set(allMaids.map(m => m.id));

    // Limpiar reportes de habitaciones que ya no existen
    for (const report of allReports) {
      const roomId = report.room?.id || report.room_id;

      if (roomId && !validRoomIds.has(roomId)) {
        // No eliminar si no está sincronizado (podría estar pendiente)
        if (report._synced) {
          await del('reports', report._id);
          orphansRemoved++;
          console.log(`[Cleanup] Reporte huérfano eliminado: ${report._id} (habitación no existe)`);
        }
      }
    }

    // Limpiar asignaciones de camareras en habitaciones que ya no existen
    for (const room of allRooms) {
      if (room.maid && !validMaidIds.has(room.maid)) {
        room.maid = null;
        await put('rooms', room);
        orphansRemoved++;
        console.log(`[Cleanup] Asignación huérfana eliminada: habitación ${room.number}`);
      }
    }

    if (orphansRemoved > 0) {
      console.log(`[Cleanup] ${orphansRemoved} datos huérfanos eliminados`);
    }

    return orphansRemoved;
  } catch (error) {
    console.error('[Cleanup] Error al limpiar datos huérfanos:', error);
    return 0;
  }
}

/**
 * Ejecuta todas las tareas de limpieza de IndexedDB
 * Se recomienda ejecutar periódicamente (ej: al iniciar la app)
 */
export async function runFullCleanup() {
  console.log('[Cleanup] Iniciando limpieza completa de IndexedDB...');

  const results = {
    duplicateReports: 0,
    syncedOutbox: 0,
    oldReports: 0,
    orphanedData: 0
  };

  results.duplicateReports = await cleanDuplicateReports();
  results.syncedOutbox = await cleanSyncedOutbox();
  results.oldReports = await cleanOldReports(30);
  results.orphanedData = await cleanOrphanedData();

  const totalCleaned = Object.values(results).reduce((sum, val) => sum + val, 0);

  console.log('[Cleanup] Limpieza completa finalizada:', results);
  console.log(`[Cleanup] Total de items limpiados: ${totalCleaned}`);

  return results;
}
