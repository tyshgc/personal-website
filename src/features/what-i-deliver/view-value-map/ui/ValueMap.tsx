import type { FC } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type Phase = { jp: string; en: string };
type Cell = {
  primary: string;
  secondary?: string;
  note?: string;
  heat: number;
  empty?: boolean;
  core?: boolean;
};
type Row = { title: string; titleEn: string; cells: ReadonlyArray<Cell> };

const PHASES: ReadonlyArray<Phase> = [
  { jp: "発見", en: "DISCOVER" },
  { jp: "事業設計", en: "DESIGN" },
  { jp: "要件・上流", en: "SPEC" },
  { jp: "開発・実装", en: "BUILD" },
  { jp: "リリース", en: "SHIP" },
  { jp: "運用・分析", en: "LEARN" },
];

const ROWS: ReadonlyArray<Row> = [
  {
    title: "事業",
    titleEn: "BUSINESS",
    cells: [
      { primary: "課題発見", secondary: "仮説検証", heat: 0.5 },
      { primary: "事業設計", heat: 0.65 },
      { primary: "要求の翻訳", heat: 1, core: true },
      { primary: "—", heat: 0, empty: true },
      { primary: "提供戦略", secondary: "GTM", heat: 0.5 },
      { primary: "ユーザ調査", secondary: "分析", note: "定性・定量", heat: 0.5 },
    ],
  },
  {
    title: "開発",
    titleEn: "DEVELOP",
    cells: [
      { primary: "技術検証", secondary: "PoC", heat: 0.4 },
      { primary: "ドメインモデリング", heat: 0.75 },
      { primary: "要件定義", secondary: "上流設計", heat: 0.9 },
      { primary: "実装・QA", note: "受け入れ条件", heat: 0.5 },
      { primary: "リリース", heat: 0.4 },
      { primary: "運用・保守", heat: 0.4 },
    ],
  },
];

function heatStyle(heat: number): Record<string, string> {
  if (heat <= 0) return {};
  const pct = Math.round(heat * 40);
  return {
    backgroundColor: `color-mix(in srgb, var(--color-accent) ${pct}%, transparent)`,
  };
}

const CellBox: FC<{ cell: Cell }> = ({ cell }) => {
  if (cell.empty) {
    return (
      <div class="flex h-full items-center justify-center rounded-md border border-dashed border-line p-3 text-muted">
        <span class="font-mono text-xs">—</span>
      </div>
    );
  }
  return (
    <div
      class={cn(
        "flex h-full flex-col justify-center rounded-md border p-3 text-paper transition-colors",
        cell.core ? "border-accent" : "border-line",
      )}
      style={heatStyle(cell.heat)}
    >
      <div class="text-sm font-medium leading-tight">{cell.primary}</div>
      {cell.secondary ? (
        <div class="mt-0.5 text-xs leading-tight text-muted">{cell.secondary}</div>
      ) : null}
      {cell.note ? (
        <div class="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
          {cell.note}
        </div>
      ) : null}
    </div>
  );
};

export const ValueMap: FC = () => {
  return (
    <div class="overflow-x-auto">
      <div class="min-w-[720px]">
        <div class="grid grid-cols-[80px_repeat(6,1fr)] gap-2">
          <div />
          {PHASES.map((p) => (
            <div class="px-1 pb-1">
              <div class="text-xs text-paper">{p.jp}</div>
              <div class="font-mono text-[10px] uppercase tracking-wider text-muted">{p.en}</div>
            </div>
          ))}

          {ROWS.map((row) => (
            <>
              <div class="flex flex-col items-end justify-center pr-2 text-right">
                <div class="text-xs text-paper">{row.title}</div>
                <div class="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {row.titleEn}
                </div>
              </div>
              {row.cells.map((cell) => (
                <CellBox cell={cell} />
              ))}
            </>
          ))}
        </div>

        <div class="mt-6 grid grid-cols-[80px_repeat(6,1fr)] gap-2 font-mono text-[10px] text-muted">
          <div />
          <div class="col-span-2 rounded border border-line px-2 py-1 text-center">
            サービスデザイン
          </div>
          <div class="col-span-3 rounded border border-line px-2 py-1 text-center">
            RDRA / DDD / Event Storming
          </div>
          <div class="rounded border border-line px-2 py-1 text-center">定性・定量</div>
        </div>

        <div class="mt-6 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>
            最も濃い核は〈要求の翻訳〉— サービスデザインとドメインモデリングが重なる継ぎ目
          </span>
          <span class="flex items-center gap-2">
            <span>価値: 低</span>
            <span
              class="h-2 w-24 rounded"
              style={{
                background:
                  "linear-gradient(to right, color-mix(in srgb, var(--color-accent) 0%, transparent), color-mix(in srgb, var(--color-accent) 40%, transparent))",
              }}
            />
            <span>高</span>
          </span>
        </div>
      </div>
    </div>
  );
};
