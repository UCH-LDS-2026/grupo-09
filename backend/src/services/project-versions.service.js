import { getDatabasePool } from "../config/database.js";
import { buildVersionSummary, normalizeVersionSnapshot } from "./project-snapshots.service.js";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseSnapshot(value) {
  if (Buffer.isBuffer(value)) return JSON.parse(value.toString("utf8"));
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

function mapRepositoryRow(row) {
  return {
    id: Number(row.id),
    projectId: Number(row.projectId ?? row.proyecto_id),
    name: row.name ?? row.nombre,
    description: row.description ?? row.descripcion ?? null,
    snapshot: row.snapshot ?? parseSnapshot(row.snapshot_json),
    createdBy: row.createdBy ?? row.creado_por ?? null,
    createdAt: row.createdAt ?? row.creado_en,
    trafficRps: Number(row.trafficRps ?? row.trafico_rps ?? 0),
    nodeCount: Number(row.nodeCount ?? row.cantidad_nodos ?? 0),
    avgLatencyMs: row.avgLatencyMs ?? row.latencia_promedio_ms ?? null,
    errorRate: row.errorRate ?? row.tasa_error ?? null,
    monthlyCost: row.monthlyCost ?? row.costo_mensual ?? null,
  };
}

const mysqlProjectVersionsRepository = {
  async findOwnedProject(projectId, email) {
    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      `SELECT p.id, p.usuario_id AS userId
       FROM proyectos p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = ? AND u.email = ?
       LIMIT 1`,
      [
        projectId,
        String(email ?? "")
          .trim()
          .toLowerCase(),
      ],
    );
    return rows[0] ?? null;
  },

  async insertVersion(version) {
    const pool = getDatabasePool();
    const [result] = await pool.execute(
      `INSERT INTO versiones_escenarios (
        proyecto_id,
        creado_por_usuario_id,
        nombre,
        descripcion,
        snapshot_json,
        trafico_rps,
        cantidad_nodos,
        latencia_promedio_ms,
        tasa_error,
        costo_mensual
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        version.projectId,
        version.createdByUserId,
        version.name,
        version.description,
        JSON.stringify(version.snapshot),
        version.trafficRps,
        version.nodeCount,
        version.avgLatencyMs,
        version.errorRate,
        version.monthlyCost,
      ],
    );

    const [rows] = await pool.execute(
      `SELECT
        v.id,
        v.proyecto_id AS projectId,
        v.nombre AS name,
        v.descripcion AS description,
        v.snapshot_json AS snapshot,
        u.nombre AS createdBy,
        v.creado_en AS createdAt,
        v.trafico_rps AS trafficRps,
        v.cantidad_nodos AS nodeCount,
        v.latencia_promedio_ms AS avgLatencyMs,
        v.tasa_error AS errorRate,
        v.costo_mensual AS monthlyCost
      FROM versiones_escenarios v
      LEFT JOIN usuarios u ON u.id = v.creado_por_usuario_id
      WHERE v.id = ?
      LIMIT 1`,
      [result.insertId],
    );
    return rows[0];
  },

  async listVersions(projectId) {
    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      `SELECT
        v.id,
        v.proyecto_id AS projectId,
        v.nombre AS name,
        v.descripcion AS description,
        u.nombre AS createdBy,
        v.creado_en AS createdAt,
        v.trafico_rps AS trafficRps,
        v.cantidad_nodos AS nodeCount,
        v.latencia_promedio_ms AS avgLatencyMs,
        v.tasa_error AS errorRate,
        v.costo_mensual AS monthlyCost
      FROM versiones_escenarios v
      LEFT JOIN usuarios u ON u.id = v.creado_por_usuario_id
      WHERE v.proyecto_id = ?
      ORDER BY v.creado_en DESC, v.id DESC`,
      [projectId],
    );
    return rows;
  },

  async findVersion(projectId, versionId) {
    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      `SELECT
        v.id,
        v.proyecto_id AS projectId,
        v.nombre AS name,
        v.descripcion AS description,
        v.snapshot_json AS snapshot,
        u.nombre AS createdBy,
        v.creado_en AS createdAt,
        v.trafico_rps AS trafficRps,
        v.cantidad_nodos AS nodeCount,
        v.latencia_promedio_ms AS avgLatencyMs,
        v.tasa_error AS errorRate,
        v.costo_mensual AS monthlyCost
      FROM versiones_escenarios v
      LEFT JOIN usuarios u ON u.id = v.creado_por_usuario_id
      WHERE v.proyecto_id = ? AND v.id = ?
      LIMIT 1`,
      [projectId, versionId],
    );
    return rows[0] ?? null;
  },
};

function normalizeName(value) {
  const name = String(value ?? "").trim();
  if (!name) throw createHttpError(400, "Poné un nombre para la versión.");
  return name.slice(0, 120);
}

function mapSummary(rawRow) {
  const row = mapRepositoryRow(rawRow);
  const formatMetric = (value, suffix, digits = 0) =>
    value === null || value === undefined ? null : `${Number(value).toFixed(digits)}${suffix}`;
  const metrics = [
    `${row.trafficRps} req/s`,
    `${row.nodeCount} componentes`,
    formatMetric(row.avgLatencyMs, " ms"),
    formatMetric(row.errorRate === null ? null : Number(row.errorRate) * 100, "%", 1),
  ].filter(Boolean);

  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    summary: metrics.join(" · "),
    createdBy: row.createdBy,
    createdAt: new Date(row.createdAt).toISOString(),
    trafficRps: row.trafficRps,
    nodeCount: row.nodeCount,
    avgLatencyMs: row.avgLatencyMs === null ? null : Number(row.avgLatencyMs),
    errorRate: row.errorRate === null ? null : Number(row.errorRate),
    monthlyCost: row.monthlyCost === null ? null : Number(row.monthlyCost),
  };
}

export function createProjectVersionsService(repository = mysqlProjectVersionsRepository) {
  async function assertOwnership(projectId, email) {
    const project = await repository.findOwnedProject(projectId, email);
    if (!project) {
      throw createHttpError(404, "No se encontró el proyecto para este usuario.");
    }
    return project;
  }

  return {
    async createVersion(projectId, payload, user) {
      const project = await assertOwnership(projectId, user?.email);
      const snapshot = normalizeVersionSnapshot(payload?.snapshot);
      const summary = buildVersionSummary(snapshot);
      const inserted = await repository.insertVersion({
        projectId,
        createdByUserId: Number(project.userId ?? project.usuario_id),
        name: normalizeName(payload?.name ?? payload?.nombre),
        description: payload?.description ? String(payload.description).trim().slice(0, 500) : null,
        snapshot,
        ...summary,
      });
      return mapSummary(inserted);
    },

    async listVersions(projectId, email) {
      await assertOwnership(projectId, email);
      const rows = await repository.listVersions(projectId);
      return rows
        .map(mapSummary)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
    },

    async getVersion(projectId, versionId, email) {
      await assertOwnership(projectId, email);
      const rawVersion = await repository.findVersion(projectId, versionId);
      if (!rawVersion) throw createHttpError(404, "No se encontró la versión solicitada.");

      const row = mapRepositoryRow(rawVersion);
      return {
        ...mapSummary(rawVersion),
        snapshot: normalizeVersionSnapshot(row.snapshot),
      };
    },
  };
}

export const projectVersionsService = createProjectVersionsService();
