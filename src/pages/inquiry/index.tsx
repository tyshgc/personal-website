import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { Card } from "@/shared/ui/cards";

export const InquiryPage: FC = () => {
  return (
    <Layout title="Inquiry" currentPath="/inquiry">
      <h1 class="text-4xl font-bold tracking-tight text-paper"># Inquiry</h1>
      <p class="mt-6 text-sm text-muted">お問い合わせはメールでお願いします。</p>

      <section class="mt-12">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## availability</h2>
        <Card class="mt-4">
          <Card.Content>
            <p class="text-sm text-muted">
              リソース空き状況がここに入ります（Step 5以降で
              <code class="font-mono text-paper">availability.json</code> から表示）。
            </p>
          </Card.Content>
        </Card>
      </section>

      <section class="mt-12">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## contact</h2>
        <p class="mt-4 font-mono text-sm">
          <a
            href="mailto:hello@tyshgc.pw"
            class="text-accent hover:underline hover:underline-offset-4"
          >
            hello@tyshgc.pw
          </a>
        </p>
      </section>
    </Layout>
  );
};
