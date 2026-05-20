import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Client, isFullPage } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints";

import type {
  ExternalSite,
  ServiceType,
} from "../src/shared/types/external-site";
import type {
  Output,
  OutputBlock,
  OutputCategory,
  OutputCover,
  OutputMeta,
  OutputStatus,
  OutputTag,
} from "../src/shared/types/output";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUTS_DIR = resolve(ROOT, "src/content/outputs");
const CONTENT_DIR = resolve(ROOT, "src/content");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

function extractTitle(page: PageObjectResponse, propName = "title"): string {
  const prop = page.properties[propName];
  if (prop?.type !== "title") return "";
  return prop.title.map((t) => t.plain_text).join("");
}

function extractText(page: PageObjectResponse, propName: string): string {
  const prop = page.properties[propName];
  if (prop?.type !== "rich_text") return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}

function extractSelect<T extends string>(page: PageObjectResponse, propName: string): T | undefined {
  const prop = page.properties[propName];
  if (prop?.type !== "select" || !prop.select) return undefined;
  return prop.select.name as T;
}

function extractMultiSelect<T extends string>(
  page: PageObjectResponse,
  propName: string,
): ReadonlyArray<T> {
  const prop = page.properties[propName];
  if (prop?.type !== "multi_select") return [];
  return prop.multi_select.map((opt) => opt.name as T);
}

function extractDate(page: PageObjectResponse, propName: string): string {
  const prop = page.properties[propName];
  if (prop?.type !== "date" || !prop.date) return "";
  return prop.date.start;
}

function extractUrl(page: PageObjectResponse, propName: string): string {
  const prop = page.properties[propName];
  if (prop?.type !== "url" || !prop.url) return "";
  return prop.url;
}

function extractCheckbox(page: PageObjectResponse, propName: string): boolean {
  const prop = page.properties[propName];
  if (prop?.type !== "checkbox") return false;
  return prop.checkbox;
}

function extractFirstFile(page: PageObjectResponse, propName: string): string | undefined {
  const prop = page.properties[propName];
  if (prop?.type !== "files" || prop.files.length === 0) return undefined;
  const file = prop.files[0];
  if (!file) return undefined;
  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return undefined;
}

function extractCover(page: PageObjectResponse): OutputCover | undefined {
  const url = extractFirstFile(page, "cover");
  return url ? { url } : undefined;
}

function toMeta(page: PageObjectResponse): OutputMeta | null {
  const slug = extractText(page, "slug");
  if (!slug) {
    console.warn(`[skip] page ${page.id} has no slug — skipping`);
    return null;
  }
  const status = extractSelect<OutputStatus>(page, "status");
  if (status !== "Published") return null;

  const category = extractSelect<OutputCategory>(page, "category");
  if (!category) {
    console.warn(`[skip] page ${page.id} (${slug}) has no category — skipping`);
    return null;
  }

  const cover = extractCover(page);
  const base: Omit<OutputMeta, "cover"> = {
    id: page.id,
    title: extractTitle(page),
    slug,
    status,
    category,
    tags: extractMultiSelect<OutputTag>(page, "tags"),
    summary: extractText(page, "summary"),
    publishedAt: extractDate(page, "publishedAt"),
    updatedAt: extractDate(page, "updatedAt"),
  };
  return cover ? { ...base, cover } : base;
}

function toExternalSite(page: PageObjectResponse): ExternalSite | null {
  const name = extractTitle(page, "name");
  const type = extractSelect<ServiceType>(page, "type");
  if (!name || !type) {
    console.warn(`[skip] external-site ${page.id} missing name or type`);
    return null;
  }
  const iconFile = extractFirstFile(page, "iconFile");
  const base: Omit<ExternalSite, "iconFile"> = {
    id: page.id,
    name,
    accountName: extractText(page, "accountName"),
    url: extractUrl(page, "url"),
    type,
    showOnTop: extractCheckbox(page, "showOnTop"),
  };
  return iconFile ? { ...base, iconFile } : base;
}

async function fetchBlocksRecursive(
  notion: Client,
  blockId: string,
): Promise<ReadonlyArray<OutputBlock>> {
  const results: OutputBlock[] = [];
  let cursor: string | undefined = undefined;
  do {
    const response = await notion.blocks.children.list(
      cursor
        ? { block_id: blockId, start_cursor: cursor, page_size: 100 }
        : { block_id: blockId, page_size: 100 },
    );
    for (const block of response.results) {
      if (!("type" in block)) continue;
      const full = block as BlockObjectResponse;
      const node: OutputBlock = full.has_children
        ? { ...full, children: await fetchBlocksRecursive(notion, full.id) }
        : { ...full };
      results.push(node);
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);
  return results;
}

async function queryAllPages(
  notion: Client,
  dataSourceId: string,
  options: {
    filter?: QueryDataSourceParameters["filter"];
    sorts?: QueryDataSourceParameters["sorts"];
  } = {},
): Promise<ReadonlyArray<PageObjectResponse>> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;
  do {
    const baseParams: QueryDataSourceParameters = {
      data_source_id: dataSourceId,
      ...(options.filter ? { filter: options.filter } : {}),
      ...(options.sorts ? { sorts: options.sorts } : {}),
      page_size: 100,
    };
    const response = await notion.dataSources.query(
      cursor ? { ...baseParams, start_cursor: cursor } : baseParams,
    );
    for (const page of response.results) {
      if (isFullPage(page)) pages.push(page);
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);
  return pages;
}

async function syncOutputs(notion: Client, dataSourceId: string): Promise<void> {
  console.log(`\nQuerying Outputs (status=Published) from ${dataSourceId}...`);
  const pages = await queryAllPages(notion, dataSourceId, {
    filter: { property: "status", select: { equals: "Published" } },
    sorts: [{ property: "publishedAt", direction: "descending" }],
  });
  console.log(`  → ${pages.length} published pages found`);

  await mkdir(OUTPUTS_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  for (const page of pages) {
    const meta = toMeta(page);
    if (!meta) {
      skipped++;
      continue;
    }
    console.log(`  fetching blocks: ${meta.slug} (${meta.title})`);
    const blocks = await fetchBlocksRecursive(notion, page.id);
    const output: Output = { meta, blocks };
    const filePath = resolve(OUTPUTS_DIR, `${meta.slug}.json`);
    await writeFile(filePath, JSON.stringify(output, null, 2), "utf8");
    written++;
  }
  console.log(`  outputs: written ${written}, skipped ${skipped}`);
}

async function syncExternals(notion: Client, dataSourceId: string): Promise<void> {
  console.log(`\nQuerying External Sites from ${dataSourceId}...`);
  const pages = await queryAllPages(notion, dataSourceId);
  console.log(`  → ${pages.length} entries found`);

  const sites: ExternalSite[] = [];
  for (const page of pages) {
    const site = toExternalSite(page);
    if (site) sites.push(site);
  }

  await mkdir(CONTENT_DIR, { recursive: true });
  const filePath = resolve(CONTENT_DIR, "externals.json");
  await writeFile(filePath, JSON.stringify(sites, null, 2), "utf8");
  console.log(`  externals: written ${sites.length} entries to externals.json`);
}

async function main(): Promise<void> {
  const apiKey = requireEnv("NOTION_API_KEY");
  const outputsId = requireEnv("NOTION_OUTPUTS_DATA_SOURCE_ID");
  const externalsId = requireEnv("NOTION_EXTERNALS_DATA_SOURCE_ID");

  const notion = new Client({ auth: apiKey });

  await syncOutputs(notion, outputsId);
  await syncExternals(notion, externalsId);

  console.log("\nDone.");
}

await main();
