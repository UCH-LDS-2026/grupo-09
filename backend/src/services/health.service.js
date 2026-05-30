export const healthService = {
  getStatus() {
    return {
      status: "ok",
      service: "softwareestres-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },
};
