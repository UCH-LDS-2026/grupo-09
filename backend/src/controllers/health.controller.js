import { healthService } from "../services/health.service.js";

export const healthController = {
  getHealth(_request, response) {
    response.status(200).json(healthService.getStatus());
  },
};
