import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { OutputCard } from "@/entities/output";
import { ExternalSiteLink } from "@/entities/external-site";
import type { ExternalSite } from "@/shared/types/external-site";
import type { Output } from "@/shared/types/output";
import { Card } from "@/shared/ui/cards";

type HomePageProps = {
  latestOutputs: ReadonlyArray<Output>;
  externals: ReadonlyArray<ExternalSite>;
};

export const HomePage: FC<HomePageProps> = ({ latestOutputs, externals }) => {
  return (
    <Layout currentPath="/">
      <section>
        <h1 class="text-4xl font-bold tracking-tight text-paper">
          # Tsuyoshi Higuchi
        </h1>
        <p class="mt-3 font-mono text-sm text-muted">
          &gt; service-designer / software-engineer / ux-analyst / ui-designer / horse-rider
        </p>
      </section>

      <section class="mt-16">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">
          ## profile
        </h2>
        <Card class="mt-4">
          <Card.Content>
            <p class="text-sm text-muted">
              プロフィール抜粋がここに入ります（Step 6 以降で実装）。
            </p>
          </Card.Content>
        </Card>
      </section>

      <section class="mt-16">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">
          ## latest_outputs
        </h2>
        <div class="mt-4">
          {latestOutputs.length === 0 ? (
            <Card>
              <Card.Content>
                <p class="text-sm text-muted">
                  まだアウトプットがありません。<code class="font-mono text-paper">/publish</code>{" "}
                  で同期してください。
                </p>
              </Card.Content>
            </Card>
          ) : (
            <ul class="flex flex-col gap-3">
              {latestOutputs.map((output) => (
                <li>
                  <OutputCard meta={output.meta} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section class="mt-16">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">
          ## externals
        </h2>
        <div class="mt-4">
          {externals.length === 0 ? (
            <Card>
              <Card.Content>
                <p class="text-sm text-muted">
                  外部サイト未登録。<code class="font-mono text-paper">/publish</code> で同期してください。
                </p>
              </Card.Content>
            </Card>
          ) : (
            <ul class="grid gap-3 sm:grid-cols-2">
              {externals.map((site) => (
                <li>
                  <ExternalSiteLink site={site} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};
