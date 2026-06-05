import { getDatabasePool } from "../config/database.js";
import { normalizeProjectGraph } from "../../../shared/simulator-core.js";

const DEFAULT_PASSWORD_HASH = "demo-user-managed-by-api";

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
  const name = String(user.name ?? "Usuario Demo").trim() || "Usuario Demo";
  const validRoles = new Set(["admin", "architect", "viewer"]);
  const role = validRoles.has(user.role) ? user.role : "architect";

  if (!email) {
    throw createHttpError(400, "El email del usuario es obligatorio para guardar proyectos.");
  }

  return { email, name, role };
}

function normalizeProjectPayload(payload = {}) {
  const name = String(payload.name ?? "Proyecto sin nombre").trim() || "Proyecto sin nombre";
  const traffic = Math.max(0, Math.round(Number(payload.traffic ?? 600)));
  const running = Boolean(payload.running ?? true);
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
  const edges = Array.isArray(payload.edges) ? payload.edges : [];

  if (!nodes.length) {
    throw createHttpError(400, "El proyecto debe tener al menos un nodo.");
  }

  const graph = normalizeProjectGraph(nodes, edges, { requirePosition: true });

  return {
    id: payload.id ? Number(payload.id) : null,
    user: normalizeUser(payload.user),
    name: name.slice(0, 160),
    description: payload.description ? String(payload.description) : null,
    traffic,
    running,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}

async function findUserIdByEmail(connection, email) {
  const [rows] = await connection.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0]?.id ?? null;
}

async function ensureUser(connection, user) {
  const existingId = await findUserIdByEmail(connection, user.email);

  if (existingId) {
    await connection.execute("UPDATE users SET name = ?, role = ? WHERE id = ?", [
      user.name,
      user.role,
      existingId,
    ]);
    return existingId;
  }

  const [result] = await connection.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [user.name, user.email, DEFAULT_PASSWORD_HASH, user.role],
  );

  return result.insertId;
}

async function getComponentTypeMap(connection) {
  const [rows] = await connection.execute(
    "SELECT id, code FROM component_types WHERE is_active = TRUE",
  );
  return new Map(rows.map((row) => [row.code, row.id]));
}

async function assertProjectOwnership(connection, projectId, userId) {
  const [rows] = await connection.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", [
    projectId,
    userId,
  ]);

  if (!rows.length) {
    throw createHttpError(404, "No se encontró el proyecto para este usuario.");
  }
}

async function replaceProjectNodesAndEdges(connection, projectId, nodes, edges) {
  await connection.execute("DELETE FROM projects_edges WHERE project_id = ?", [projectId]);
  await connection.execute("DELETE FROM projects_nodes WHERE project_id = ?", [projectId]);

  const componentTypes = await getComponentTypeMap(connection);
  const nodeIds = new Map();

  for (const node of nodes) {
    const componentTypeId = componentTypes.get(node.kind);

    if (!componentTypeId) {
      throw createHttpError(400, `Tipo de componente inválido: ${node.kind}`);
    }

    const [result] = await connection.execute(
      `INSERT INTO projects_nodes (
        project_id,
        component_type_id,
        client_node_id,
        name,
        position_x,
        position_y,
        instances,
        capacity_rps,
        base_latency_ms,
        queue_size,
        timeout_ms,
        cost_per_instance
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
      `INSERT INTO projects_edges (
        project_id,
        client_edge_id,
        from_node_id,
        to_node_id,
        is_async
      ) VALUES (?, ?, ?, ?, ?)`,
      [projectId, String(edge.id), fromNodeId, toNodeId, Boolean(edge.async)],
    );
  }
}

async function createProject(connection, payload, userId) {
  const slug = `${slugify(payload.name)}-${Date.now().toString(36)}`;
  const [result] = await connection.execute(
    `INSERT INTO projects (
      user_id,
      name,
      slug,
      description,
      incoming_traffic_rps,
      is_running
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, payload.name, slug, payload.description, payload.traffic, payload.running],
  );

  return result.insertId;
}

async function updateProject(connection, payload, userId) {
  await assertProjectOwnership(connection, payload.id, userId);

  await connection.execute(
    `UPDATE projects
      SET name = ?,
          description = ?,
          incoming_traffic_rps = ?,
          is_running = ?
      WHERE id = ?`,
    [payload.name, payload.description, payload.traffic, payload.running, payload.id],
  );

  return payload.id;
}

function mapProjectRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    incomingTrafficRps: row.incoming_traffic_rps,
    isRunning: Boolean(row.is_running),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserIdForList(pool, email) {
  if (!email) return null;

  const [rows] = await pool.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [
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
        name,
        slug,
        description,
        incoming_traffic_rps,
        is_running,
        created_at,
        updated_at
      FROM projects
      WHERE user_id = ?
      ORDER BY updated_at DESC, id DESC`,
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
        name,
        slug,
        description,
        incoming_traffic_rps,
        is_running,
        created_at,
        updated_at
      FROM projects
      WHERE id = ?
        AND user_id = ?
      LIMIT 1`,
      [projectId, userId],
    );

    if (!projectRows.length) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    const [nodeRows] = await pool.execute(
      `SELECT
        pn.client_node_id,
        ct.code AS kind,
        pn.name,
        pn.position_x,
        pn.position_y,
        pn.instances,
        pn.capacity_rps,
        pn.base_latency_ms,
        pn.queue_size,
        pn.timeout_ms,
        pn.cost_per_instance
      FROM projects_nodes pn
      INNER JOIN component_types ct ON ct.id = pn.component_type_id
      WHERE pn.project_id = ?
      ORDER BY pn.id ASC`,
      [projectId],
    );

    const [edgeRows] = await pool.execute(
      `SELECT
        pe.client_edge_id,
        source.client_node_id AS from_client_node_id,
        target.client_node_id AS to_client_node_id,
        pe.is_async
      FROM projects_edges pe
      INNER JOIN projects_nodes source ON source.id = pe.from_node_id
      INNER JOIN projects_nodes target ON target.id = pe.to_node_id
      WHERE pe.project_id = ?
      ORDER BY pe.id ASC`,
      [projectId],
    );

    return {
      ...mapProjectRow(projectRows[0]),
      nodes: nodeRows.map((row) => ({
        id: row.client_node_id,
        kind: row.kind,
        name: row.name,
        x: Number(row.position_x),
        y: Number(row.position_y),
        instances: row.instances,
        capacity: row.capacity_rps,
        baseLatency: row.base_latency_ms,
        queueSize: row.queue_size,
        timeout: row.timeout_ms,
        costPerInstance: Number(row.cost_per_instance),
      })),
      edges: edgeRows.map((row) => ({
        id: row.client_edge_id,
        from: row.from_client_node_id,
        to: row.to_client_node_id,
        async: Boolean(row.is_async),
      })),
    };
  },

  async saveProject(rawPayload) {
    const payload = normalizeProjectPayload(rawPayload);
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

    const [result] = await pool.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", [
      projectId,
      userId,
    ]);

    if (!result.affectedRows) {
      throw createHttpError(404, "Proyecto no encontrado para este usuario.");
    }

    return { deleted: true };
  },
};
