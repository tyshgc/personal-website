import type {
  ColumnBlockObjectResponse,
  ColumnListBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { BlockRenderer } from "./BlockRenderer";

type ColumnListBlock = ColumnListBlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

type ColumnsProps = {
  block: ColumnListBlock;
};

export const Columns: FC<ColumnsProps> = ({ block }) => {
  const columns = (block.children ?? []).filter(
    (c): c is ColumnBlockObjectResponse & { children?: ReadonlyArray<OutputBlock> } =>
      c.type === "column",
  );

  return (
    <div class="my-6 grid gap-4 md:grid-cols-2">
      {columns.map((col) => (
        <div>
          {col.children ? <BlockRenderer blocks={col.children} /> : null}
        </div>
      ))}
    </div>
  );
};
