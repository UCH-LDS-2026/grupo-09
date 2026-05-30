import { databaseHealthService } from "../services/database-health.service.js";

export const databaseHealthController = {
  async getHealth(_request, response) {
    try {
      const status = await databaseHealthService.getStatus();
      response.status(200).json(status);
    } catch (error) {
      response.status(503).json({
        status: "error",
        database: "unavailable",
        message: "No se pudo conectar con MySQL. Verifica que MySQL este abierto y la base exista.",
        details: error.message,
      });
    }
  },
};
