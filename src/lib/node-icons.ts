import {
  Shield,
  GitFork,
  Terminal,
  Gauge,
  Database,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { NodeKind } from "@/lib/simulator";

export const NODE_ICON: Record<NodeKind, LucideIcon> = {
  api_gateway: Shield,
  load_balancer: GitFork,
  app_service: Terminal,
  cache: Gauge,
  database: Database,
  queue: Inbox,
};
