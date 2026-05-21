import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { OutputDetail } from "@/features/outputs/view-detail";
import type { Output } from "@/shared/types/output";

type OutputDetailPageProps = {
  output: Output;
};

export const OutputDetailPage: FC<OutputDetailPageProps> = ({ output }) => {
  return (
    <Layout
      title={output.meta.title}
      description={output.meta.summary}
      currentPath="/outputs"
      path={`/outputs/${output.meta.slug}`}
      ogImage={`/og/${output.meta.slug}.png`}
    >
      <OutputDetail output={output} />
    </Layout>
  );
};
