import { projectVersionsService } from "../services/project-versions.service.js";

function parsePositiveId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`${label} debe ser un número positivo.`);
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function assertCanCreate(user) {
  if (user?.rol !== "lector") return;
  const error = new Error("El rol lector no puede crear versiones.");
  error.statusCode = 403;
  throw error;
}

export const projectVersionsController = {
  async create(request, response, next) {
    try {
      assertCanCreate(request.user);
      const version = await projectVersionsService.createVersion(
        parsePositiveId(request.params.projectId, "El id del proyecto"),
        request.body,
        request.user,
      );
      response.status(201).json({ version });
    } catch (error) {
      next(error);
    }
  },

  async list(request, response, next) {
    try {
      const versions = await projectVersionsService.listVersions(
        parsePositiveId(request.params.projectId, "El id del proyecto"),
        request.user.email,
      );
      response.status(200).json({ versions });
    } catch (error) {
      next(error);
    }
  },

  async getById(request, response, next) {
    try {
      const version = await projectVersionsService.getVersion(
        parsePositiveId(request.params.projectId, "El id del proyecto"),
        parsePositiveId(request.params.versionId, "El id de la versión"),
        request.user.email,
      );
      response.status(200).json({ version });
    } catch (error) {
      next(error);
    }
  },
};
