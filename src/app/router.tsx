import { Hono } from "hono";
import { ssgParams } from "hono/ssg";

import { loadAllOutputs, loadOutputBySlug } from "@/entities/output";
import { loadAllExternalSites, loadTopExternalSites } from "@/entities/external-site";
import { ExternalsPage } from "@/pages/externals";
import { HomePage } from "@/pages/home";
import { InquiryPage } from "@/pages/inquiry";
import { OutputDetailPage } from "@/pages/output-detail";
import { OutputsPage } from "@/pages/outputs";
import { ProfilePage } from "@/pages/profile";
import { WhatIDeliverPage } from "@/pages/what-i-deliver";

export function createRouter(): Hono {
  const app = new Hono();

  app.get("/", async (c) => {
    const [outputs, externals] = await Promise.all([loadAllOutputs(), loadTopExternalSites()]);
    return c.html(<HomePage latestOutputs={outputs.slice(0, 5)} externals={externals} />);
  });
  app.get("/profile", (c) => c.html(<ProfilePage />));
  app.get("/what-i-deliver", (c) => c.html(<WhatIDeliverPage />));
  app.get("/outputs", async (c) => {
    const outputs = await loadAllOutputs();
    return c.html(<OutputsPage outputs={outputs} />);
  });
  app.get(
    "/outputs/:slug",
    ssgParams(async () => {
      const outputs = await loadAllOutputs();
      return outputs.map((o) => ({ slug: o.meta.slug }));
    }),
    async (c) => {
      const slug = c.req.param("slug");
      const output = await loadOutputBySlug(slug);
      if (!output) return c.notFound();
      return c.html(<OutputDetailPage output={output} />);
    },
  );
  app.get("/externals", async (c) => {
    const sites = await loadAllExternalSites();
    return c.html(<ExternalsPage sites={sites} />);
  });
  app.get("/inquiry", (c) => c.html(<InquiryPage />));

  return app;
}
