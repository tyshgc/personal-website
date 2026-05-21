import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { loadAllOutputs } from "../src/entities/output/model/loadOutputs";
import { siteConfig } from "../src/shared/config/site";
import { theme } from "../src/shared/config/theme";
import { formatDate } from "../src/shared/utils/formatDate";

const ROOT = resolve(import.meta.dirname, "..");
const OG_DIR = resolve(ROOT, "public/og");
const INTER_DIR = resolve(ROOT, "node_modules/@fontsource/inter/files");
const NOTO_JP_DIR = resolve(ROOT, "node_modules/@fontsource/noto-sans-jp/files");

const WIDTH = 1200;
const HEIGHT = 630;

type SatoriNode = {
  type: string;
  props: {
    style: Record<string, unknown>;
    children?: SatoriNode | string | Array<SatoriNode | string>;
  };
};

function ogTemplate(title: string, subtitle: string): SatoriNode {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: theme.color.ink,
        padding: "72px",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: 28,
              color: theme.color.accent,
              letterSpacing: "0.05em",
            },
            children: subtitle,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: theme.color.paper,
              lineHeight: 1.2,
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 28, color: theme.color.muted },
            children: siteConfig.url.replace(/^https?:\/\//, ""),
          },
        },
      ],
    },
  };
}

async function renderPng(
  node: SatoriNode,
  fonts: Awaited<ReturnType<typeof loadFonts>>,
): Promise<Buffer> {
  const svg = await satori(node as never, { width: WIDTH, height: HEIGHT, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  return resvg.render().asPng();
}

async function loadFonts() {
  const [interRegular, interBold, jpRegular, jpBold] = await Promise.all([
    readFile(resolve(INTER_DIR, "inter-latin-400-normal.woff")),
    readFile(resolve(INTER_DIR, "inter-latin-700-normal.woff")),
    readFile(resolve(NOTO_JP_DIR, "noto-sans-jp-japanese-400-normal.woff")),
    readFile(resolve(NOTO_JP_DIR, "noto-sans-jp-japanese-700-normal.woff")),
  ]);
  return [
    { name: "Inter", data: interRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: interBold, weight: 700 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: jpRegular, weight: 400 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: jpBold, weight: 700 as const, style: "normal" as const },
  ];
}

async function main(): Promise<void> {
  await mkdir(OG_DIR, { recursive: true });
  const fonts = await loadFonts();

  // Default OG image
  const defaultPng = await renderPng(
    ogTemplate(siteConfig.title, "Service Designer / Software Engineer"),
    fonts,
  );
  await writeFile(resolve(OG_DIR, "default.png"), defaultPng);

  // Per-output OG images
  const outputs = await loadAllOutputs();
  for (const { meta } of outputs) {
    const subtitle = [meta.category, formatDate(meta.publishedAt)].filter(Boolean).join("  ·  ");
    const png = await renderPng(ogTemplate(meta.title, subtitle), fonts);
    await writeFile(resolve(OG_DIR, `${meta.slug}.png`), png);
  }

  console.log(`OG images generated: ${outputs.length + 1} (default + ${outputs.length} outputs)`);
}

await main();
