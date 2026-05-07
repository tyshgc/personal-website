import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";

export const HomePage: FC = () => {
  return (
    <Layout>
      <h1 class="text-3xl font-bold tracking-tight">Tsuyoshi Higuchi</h1>
      <p class="mt-4 text-gray-600">Personal website skeleton.</p>
    </Layout>
  );
};
