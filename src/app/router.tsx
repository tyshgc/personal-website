import { Hono } from "hono";

import { HomePage } from "@/pages/home";

export function createRouter(): Hono {
  const app = new Hono();

  app.get("/", (c) => c.html(<HomePage />));

  return app;
}
