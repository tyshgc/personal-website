import type {
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { RichText } from "../RichText";

type TableBlock = TableBlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

type TableProps = {
  block: TableBlock;
};

export const Table: FC<TableProps> = ({ block }) => {
  const rows = (block.children ?? []).filter(
    (c): c is TableRowBlockObjectResponse => c.type === "table_row",
  );
  const hasHeader = block.table.has_column_header;
  const headerRow = hasHeader ? rows[0] : undefined;
  const bodyRows = hasHeader ? rows.slice(1) : rows;

  return (
    <div class="my-6 overflow-x-auto rounded-md border border-line">
      <table class="w-full border-collapse text-sm">
        {headerRow ? (
          <thead class="bg-surface">
            <tr>
              {headerRow.table_row.cells.map((cell) => (
                <th class="border-b border-line px-3 py-2 text-left font-semibold text-paper">
                  <RichText items={cell} />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {bodyRows.map((row) => (
            <tr class="border-b border-line last:border-b-0">
              {row.table_row.cells.map((cell) => (
                <td class="px-3 py-2 text-paper">
                  <RichText items={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
