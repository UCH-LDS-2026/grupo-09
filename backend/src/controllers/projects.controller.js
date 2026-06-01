import { projectsService } from "../services/projects.service.js";

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
      const project = await projectsService.getProject(Number(request.params.id));
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
        id: Number(request.params.id),
      });
      response.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  },
};
