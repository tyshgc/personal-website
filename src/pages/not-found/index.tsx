import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";

export const NotFoundPage: FC = () => {
  return (
    <Layout title="404">
      <h1 class="text-4xl font-bold tracking-tight text-paper"># 404</h1>
      <p class="mt-6 font-mono text-sm text-muted">&gt; page not found</p>
      <p class="mt-6 text-sm">
        <a href="/" class="text-accent underline-offset-4 hover:underline">
          ← back to home
        </a>
      </p>
    </Layout>
  );
};
