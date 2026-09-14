export const healthService = {
  getStatus() {
    return {
      status: "ok",
      service: "stressflow-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },
};
