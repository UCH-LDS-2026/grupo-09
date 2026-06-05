import { simulationsService } from "../services/simulations.service.js";

export const simulationsController = {
  run(request, response, next) {
    try {
      const result = simulationsService.run(request.body);
      response.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  },
};
