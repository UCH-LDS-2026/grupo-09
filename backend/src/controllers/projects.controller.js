import { projectsService } from "../services/projects.service.js";

function parseProjectId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("El id del proyecto debe ser un número positivo.");
    error.statusCode = 400;
    throw error;
  }

  return id;
}

function assertCanEdit(user) {
  if (user?.rol !== "lector") return;

  const error = new Error("El rol lector no puede modificar proyectos.");
  error.statusCode = 403;
  throw error;
}

export const projectsController = {
  async list(request, response, next) {
    try {
      const proyectos = await projectsService.listProjects(request.user.email);
      response.status(200).json({ proyectos });
    } catch (error) {
      next(error);
    }
  },

  async getById(request, response, next) {
    try {
      const proyecto = await projectsService.getProject(
        parseProjectId(request.params.id),
        request.user.email,
      );
      response.status(200).json({ proyecto });
    } catch (error) {
      next(error);
    }
  },

  async create(request, response, next) {
    try {
      assertCanEdit(request.user);
      const proyecto = await projectsService.saveProject(request.body, request.user);
      response.status(201).json({ proyecto });
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      assertCanEdit(request.user);
      const proyecto = await projectsService.saveProject(
        {
          ...request.body,
          id: parseProjectId(request.params.id),
        },
        request.user,
      );
      response.status(200).json({ proyecto });
    } catch (error) {
      next(error);
    }
  },

  async delete(request, response, next) {
    try {
      assertCanEdit(request.user);
      await projectsService.deleteProject(parseProjectId(request.params.id), request.user.email);
      response.status(200).json({ eliminado: true });
    } catch (error) {
      next(error);
    }
  },
};
