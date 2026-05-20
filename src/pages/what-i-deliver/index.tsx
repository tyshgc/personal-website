import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";

export const WhatIDeliverPage: FC = () => {
  return (
    <Layout title="What I Deliver" currentPath="/what-i-deliver">
      <h1 class="text-4xl font-bold tracking-tight text-paper">
        # What I Deliver
      </h1>
      <p class="mt-6 text-sm text-muted">
        できることの列挙がここに入ります（Step 5以降で実装）。
      </p>
    </Layout>
  );
};
