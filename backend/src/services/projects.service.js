import { getDatabasePool } from "../config/database.js";
import { normalizeProjectGraph } from "../../../shared/simulator-core.js";

const ROLES_VALIDOS = new Set(["administrador", "arquitecto", "lector"]);
const TIPO_COMPONENTE_SIMULADOR_A_ES = {
  api_gateway: "puerta_enlace_api",
  load_balancer: "balanceador_carga",
  app_service: "servicio_aplicacion",
  cache: "cache",
  database: "base_datos",
  queue: "cola",
};
const TIPO_COMPONENTE_ES_A_SIMULADOR = Object.fromEntries(
  Object.entries(TIPO_COMPONENTE_SIMULADOR_A_ES).map(([tipoSimulador, tipoEspanol]) => [
    tipoEspanol,
    tipoSimulador,
  ]),
);

const toNumber = (value) => Number(value);

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140) || "proyecto";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeUser(user = {}) {
  const email = String(user.email ?? "")
    .trim()
    .toLowerCase();
  const nombre = String(user.nombre ?? "Usuario Demo").trim() || "Usuario Demo";
  const rol = ROLES_VALIDOS.has(user.rol) ? user.rol : "arquitecto";

  if (!email) {
    throw createHttpError(400, "El email del usuario es obligatorio para guardar proyectos.");
  }

  return { email, nombre, rol };
}

function normalizeProjectPayload(payload = {}, authenticatedUser) {
  const name = String(payload.nombre ?? "Proyecto sin nombre").trim() || "Proyecto sin nombre";
  const traffic = Math.max(0, Math.round(Number(payload.trafico ?? 600)));
  const running = Boolean(payload.estaEjecutando ?? true);
  const rawNodes = payload.nodos;
  const rawEdges = payload.conexiones;
  const nodes = Array.isArray(rawNodes) ? rawNodes.map(mapNodePayloadToSimulator) : [];
  const edges = Array.isArray(rawEdges) ? rawEdges.map(mapEdgePayloadToSimulator) : [];

  if (!nodes.length) {
    throw createHttpError(400, "El proyecto debe tener al menos un nodo.");
  }

  const graph = normalizeProjectGraph(nodes, edges, { requirePosition: true });

  return {
    id: payload.id ? Number(payload.id) : null,
    user: normalizeUser(authenticatedUser ?? payload.usuario),
    name: name.slice(0, 160),
    description: payload.descripcion ? String(payload.descripcion) : null,
    traffic,
    running,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}

function mapNodePayloadToSimulator(node = {}) {
  return {
    id: node.id,
    kind: TIPO_COMPONENTE_ES_A_SIMULADOR[node.tipo],
    name: node.nombre,
    x: node.posicionX,
    y: node.posicionY,
    instances: node.instancias,
    capacity: node.capacidadRps,
    baseLatency: node.latenciaBaseMs,
    queueSize: node.tamanoCola,
    timeout: node.tiempoEsperaMs,
    costPerInstance: node.costoPorInstancia,
  };
}

function mapEdgePayloadToSimulator(edge = {}) {
  return {
    id: edge.id,
    from: edge.origen,
    to: edge.destino,
    async: edge.esAsincrona,
  };
}

async function findUserIdByEmail(connection, email) {
  const [rows] = await connection.execute("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0]?.id ?? null;
}

async function ensureUser(connection, user) {
  const existingId = await findUserIdByEmail(connection, user.email);

  if (existingId) {
    await connection.execute("UPDATE usuarios SET nombre = ?, rol = ? WHERE id = ?", [
      user.nombre,
      user.rol,
      existingId,
    ]);
    return existingId;
  }

  throw createHttpError(401, "Sesión inválida o vencida.");
}

async function getComponentTypeMap(connection) {
  const [rows] = await connection.execute(
    "SELECT id, codigo FROM tipos_componentes WHERE activo = TRUE",
  );
  return new Map(rows.map((row) => [TIPO_COMPONENTE_ES_A_SIMULADOR[row.codigo], row.id]));
}

async function assertProjectOwnership(connection, projectId, userId) {
  const [rows] = await connection.execute(
    "SELECT id FROM proyectos WHERE id = ? AND usuario_id = ?",
    [projectId, userId],
  );

  if (!rows.length) {
    throw createHttpError(404, "No se encontró el proyecto para este usuario.");
  }
}

async function replaceProjectNodesAndEdges(connection, projectId, nodes, edges) {
  await connection.execute("DELETE FROM conexiones_proyectos WHERE proyecto_id = ?", [projectId]);
  await connection.execute("DELETE FROM nodos_proyectos WHERE proyecto_id = ?", [projectId]);

  const componentTypes = await getComponentTypeMap(connection);
  const nodeIds = new Map();

  for (const node of nodes) {
    const componentTypeId = componentTypes.get(node.kind);

    if (!componentTypeId) {
      throw createHttpError(400, `Tipo de componente inválido: ${node.kind}`);
    }

    const [result] = await connection.execute(
      `INSERT INTO nodos_proyectos (
        proyecto_id,
        tipo_componente_id,
        nodo_cliente_id,
        nombre,
        posicion_x,
        posicion_y,
        instancias,
        capacidad_rps,
        latencia_base_ms,
        tamano_cola,
        tiempo_espera_ms,
        costo_por_instancia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        componentTypeId,
        String(node.id),
        String(node.name ?? "Componente"),
        toNumber(node.x),
        toNumber(node.y),
        Math.max(1, Math.round(toNumber(node.instances))),
        Math.max(1, Math.round(toNumber(node.capacity))),
        Math.max(0, Math.round(toNumber(node.baseLatency))),
        Math.max(0, Math.round(toNumber(node.queueSize))),
        Math.max(0, Math.round(toNumber(node.timeout))),
        Math.max(0, toNumber(node.costPerInstance)),
      ],
    );

    nodeIds.set(String(node.id), result.insertId);
  }

  for (const edge of edges) {
    const fromNodeId = nodeIds.get(String(edge.from));
    const toNodeId = nodeIds.get(String(edge.to));

    if (!fromNodeId || !toNodeId) continue;

    await connection.execute(
      `INSERT INTO conexiones_proyectos (
        proyecto_id,
        conexion_cliente_id,
        nodo_origen_id,
        nodo_destino_id,
        es_asincrona
      ) VALUES (?, ?, ?, ?, ?)`,
      [projectId, String(edge.id), fromNodeId, toNodeId, Boolean(edge.async)],
    );
  }
}

async function createProject(connection, payload, userId) {
  const slug = `${slugify(payload.name)}-${Date.now().toString(36)}`;
  const [result] = await connection.execute(
    `INSERT INTO proyectos (
      usuario_id,
      nombre,
      slug,
      descripcion,
      trafico_entrante_rps,
      esta_ejecutando
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, payload.name, slug, payload.description, payload.traffic, payload.running],
  );

  return result.insertId;
}

async function updateProject(connection, payload, userId) {
  await assertProjectOwnership(connection, payload.id, userId);

  await connection.execute(
    `UPDATE proyectos
      SET nombre = ?,
          descripcion = ?,
          trafico_entrante_rps = ?,
          esta_ejecutando = ?
      WHERE id = ?`,
    [payload.name, payload.description, payload.traffic, payload.running, payload.id],
  );

  return payload.id;
}

function mapProjectRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion,
    traficoEntranteRps: row.trafico_entrante_rps,
    estaEjecutando: Boolean(row.esta_ejecutando),
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

async function getUserIdForList(pool, email) {
  if (!email) return null;

  const [rows] = await pool.execute("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [
    email.trim().toLowerCase(),
  ]);

  return rows[0]?.id ?? null;
}

export const projectsService = {
  async listProjects(userEmail) {
    const pool = getDatabasePool();
    const userId = await getUserIdForList(pool, userEmail);

    if (!userId) return [];

    const [rows] = await pool.execute(
      `SELECT
        id,
        nombre,
        slug,
        descripcion,
        trafico_entrante_rps,
        esta_ejecutando,
        creado_en,
        actualizado_en
      FROM proyectos
      WHERE usuario_id = ?
      ORDER BY actualizado_en DESC, id DESC`,
      [userId],
    );

    return rows.map(mapProjectRow);
  },

  async getProject(projectId, userEmail) {
    const pool = getDatabasePool();
    const userId = await getUserIdForList(pool, userEmail);

    if (!userId) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    const [projectRows] = await pool.execute(
      `SELECT
        id,
        nombre,
        slug,
        descripcion,
        trafico_entrante_rps,
        esta_ejecutando,
        creado_en,
        actualizado_en
      FROM proyectos
      WHERE id = ?
        AND usuario_id = ?
      LIMIT 1`,
      [projectId, userId],
    );

    if (!projectRows.length) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    const [nodeRows] = await pool.execute(
      `SELECT
        pn.nodo_cliente_id,
        ct.codigo AS kind,
        pn.nombre,
        pn.posicion_x,
        pn.posicion_y,
        pn.instancias,
        pn.capacidad_rps,
        pn.latencia_base_ms,
        pn.tamano_cola,
        pn.tiempo_espera_ms,
        pn.costo_por_instancia
      FROM nodos_proyectos pn
      INNER JOIN tipos_componentes ct ON ct.id = pn.tipo_componente_id
      WHERE pn.proyecto_id = ?
      ORDER BY pn.id ASC`,
      [projectId],
    );

    const [edgeRows] = await pool.execute(
      `SELECT
        pe.conexion_cliente_id,
        origen.nodo_cliente_id AS nodo_origen_cliente_id,
        destino.nodo_cliente_id AS nodo_destino_cliente_id,
        pe.es_asincrona
      FROM conexiones_proyectos pe
      INNER JOIN nodos_proyectos origen ON origen.id = pe.nodo_origen_id
      INNER JOIN nodos_proyectos destino ON destino.id = pe.nodo_destino_id
      WHERE pe.proyecto_id = ?
      ORDER BY pe.id ASC`,
      [projectId],
    );

    return {
      ...mapProjectRow(projectRows[0]),
      nodos: nodeRows.map((row) => ({
        id: row.nodo_cliente_id,
        tipo: TIPO_COMPONENTE_SIMULADOR_A_ES[TIPO_COMPONENTE_ES_A_SIMULADOR[row.kind]],
        nombre: row.nombre,
        posicionX: Number(row.posicion_x),
        posicionY: Number(row.posicion_y),
        instancias: row.instancias,
        capacidadRps: row.capacidad_rps,
        latenciaBaseMs: row.latencia_base_ms,
        tamanoCola: row.tamano_cola,
        tiempoEsperaMs: row.tiempo_espera_ms,
        costoPorInstancia: Number(row.costo_por_instancia),
      })),
      conexiones: edgeRows.map((row) => ({
        id: row.conexion_cliente_id,
        origen: row.nodo_origen_cliente_id,
        destino: row.nodo_destino_cliente_id,
        esAsincrona: Boolean(row.es_asincrona),
      })),
    };
  },

  async saveProject(rawPayload, authenticatedUser) {
    const payload = normalizeProjectPayload(rawPayload, authenticatedUser);
    const pool = getDatabasePool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const userId = await ensureUser(connection, payload.user);
      const projectId = payload.id
        ? await updateProject(connection, payload, userId)
        : await createProject(connection, payload, userId);

      await replaceProjectNodesAndEdges(connection, projectId, payload.nodes, payload.edges);
      await connection.commit();

      return this.getProject(projectId, payload.user.email);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async deleteProject(projectId, userEmail) {
    const pool = getDatabasePool();
    const userId = await getUserIdForList(pool, userEmail);

    if (!userId) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    const [result] = await pool.execute("DELETE FROM proyectos WHERE id = ? AND usuario_id = ?", [
      projectId,
      userId,
    ]);

    if (!result.affectedRows) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    return { eliminado: true };
  },
};
