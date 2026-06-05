import { normalizeSimulationPayload, simulate } from "../../../shared/simulator-core.js";

export const simulationsService = {
  run(rawPayload) {
    const payload = normalizeSimulationPayload(rawPayload);
    return simulate(payload.nodes, payload.edges, payload.traffic);
  },
};
