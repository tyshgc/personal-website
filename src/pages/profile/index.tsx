import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";

export const ProfilePage: FC = () => {
  return (
    <Layout title="Profile" currentPath="/profile">
      <h1 class="text-4xl font-bold tracking-tight text-paper"># Profile</h1>
      <p class="mt-6 text-sm text-muted">プロフィール本文がここに入ります（Step 5以降で実装）。</p>
    </Layout>
  );
};
