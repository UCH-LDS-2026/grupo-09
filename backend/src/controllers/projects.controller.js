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

export const projectsController = {
  async list(request, response, next) {
    try {
      const projects = await projectsService.listProjects(request.query.userEmail);
      response.status(200).json({ projects });
    } catch (error) {
      next(error);
    }
  },

  async getById(request, response, next) {
    try {
      const project = await projectsService.getProject(
        parseProjectId(request.params.id),
        request.query.userEmail,
      );
      response.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  },

  async create(request, response, next) {
    try {
      const project = await projectsService.saveProject(request.body);
      response.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      const project = await projectsService.saveProject({
        ...request.body,
        id: parseProjectId(request.params.id),
      });
      response.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  },

  async delete(request, response, next) {
    try {
      await projectsService.deleteProject(
        parseProjectId(request.params.id),
        request.query.userEmail,
      );
      response.status(200).json({ deleted: true });
    } catch (error) {
      next(error);
    }
  },
};
