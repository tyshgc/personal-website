import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { OutputCard } from "@/entities/output";
import { ExternalSiteList } from "@/features/externals/view-list";
import { SkillsByCategory } from "@/features/what-i-deliver/view-skills";
import { ValueMap } from "@/features/what-i-deliver/view-value-map";
import type { ExternalSite } from "@/shared/types/external-site";
import type { Output } from "@/shared/types/output";
import type { Skill } from "@/shared/types/skill";
import { Card } from "@/shared/ui/cards";

type HomePageProps = {
  latestOutputs: ReadonlyArray<Output>;
  externals: ReadonlyArray<ExternalSite>;
  skills: ReadonlyArray<Skill>;
};

const SMOOTH_SCROLL_SCRIPT = `
addEventListener("DOMContentLoaded", () => {
  const hash = location.hash;
  if (!hash) return;
  const el = document.querySelector(hash);
  if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
});
`;

export const HomePage: FC<HomePageProps> = ({ latestOutputs, externals, skills }) => {
  return (
    <Layout currentPath="/">
      <section>
        <h1 class="text-4xl font-bold tracking-tight text-paper"># Tsuyoshi Higuchi</h1>
        <p class="mt-3 font-mono text-sm text-muted">
          &gt; service-designer / software-engineer / ux-analyst / ui-designer / horse-rider
        </p>
      </section>

      <section id="profile" class="mt-16 scroll-mt-8">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## profile</h2>
        <Card class="mt-4">
          <Card.Content>
            <p class="text-sm text-muted">プロフィール本文がここに入ります（後続で実装）。</p>
          </Card.Content>
        </Card>
      </section>

      <section id="what-i-deliver" class="mt-16 scroll-mt-8">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## what_i_deliver</h2>

        <div class="mt-6">
          <h3 class="font-mono text-xs uppercase tracking-wider text-muted">### value_map</h3>
          <p class="mt-2 text-sm text-muted">
            事業 / 開発の各レイヤで、発見からリリース・運用までどこに価値を出しているかの地図。
          </p>
          <div class="mt-4">
            <ValueMap />
          </div>
        </div>

        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-wider text-muted">### skills</h3>
          <p class="mt-2 text-sm text-muted">カテゴリ別の習熟度。0–100 の自己評価値。</p>
          <div class="mt-4">
            <SkillsByCategory skills={skills} />
          </div>
        </div>
      </section>

      <section id="outputs" class="mt-16 scroll-mt-8">
        <div class="flex items-baseline justify-between">
          <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## latest_outputs</h2>
          <a href="/outputs" class="font-mono text-xs text-accent hover:underline">
            all →
          </a>
        </div>
        <div class="mt-4">
          {latestOutputs.length === 0 ? (
            <Card>
              <Card.Content>
                <p class="text-sm text-muted">
                  まだアウトプットがありません。
                  <code class="font-mono text-paper">/publish</code> で同期してください。
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

      <section id="externals" class="mt-16 scroll-mt-8">
        <h2 class="font-mono text-xs uppercase tracking-wider text-muted">## externals</h2>
        <div class="mt-4">
          <ExternalSiteList sites={externals} />
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: SMOOTH_SCROLL_SCRIPT }} />
    </Layout>
  );
};
