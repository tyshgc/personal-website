import { Hono } from "hono";
import { ssgParams } from "hono/ssg";

import { loadAllExternalSites } from "@/entities/external-site";
import { loadAllOutputs, loadOutputBySlug } from "@/entities/output";
import { loadAllSkills } from "@/entities/skill";
import { HomePage } from "@/pages/home";
import { InquiryPage } from "@/pages/inquiry";
import { NotFoundPage } from "@/pages/not-found";
import { OutputDetailPage } from "@/pages/output-detail";
import { OutputsPage } from "@/pages/outputs";
import { siteConfig } from "@/shared/config/site";

function redirectHtml(hash: string): string {
  const target = `/${hash}`;
  const canonical = `${siteConfig.url}/${hash}`;
  return `<!doctype html><html lang="${siteConfig.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${canonical}"><title>Redirecting…</title><script>location.replace(${JSON.stringify(target)})</script></head><body></body></html>`;
}

export function createRouter(): Hono {
  const app = new Hono();

  app.get("/", async (c) => {
    const [outputs, externals, skills] = await Promise.all([
      loadAllOutputs(),
      loadAllExternalSites(),
      loadAllSkills(),
    ]);
    return c.html(
      <HomePage latestOutputs={outputs.slice(0, 5)} externals={externals} skills={skills} />,
    );
  });

  // Former standalone pages — now sections of the home page.
  app.get("/profile", (c) => c.html(redirectHtml("#profile")));
  app.get("/what-i-deliver", (c) => c.html(redirectHtml("#what-i-deliver")));
  app.get("/externals", (c) => c.html(redirectHtml("#externals")));

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

  app.get("/inquiry", (c) => c.html(<InquiryPage />));
  app.get("/404", (c) => c.html(<NotFoundPage />));

  return app;
}
