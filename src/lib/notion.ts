import { NotionAPI } from 'notion-client';
import { getPageContentBlockIds } from 'notion-utils';
import { ExtendedRecordMap } from 'notion-types';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const notion = new NotionAPI();
const LOCAL_IMAGE_ORIGIN = 'https://notion-local.host';
const BLOCKS_FETCH_CHUNK_SIZE = 100;

function getOutputDir(): string {
  return path.join(process.cwd(), 'public', 'notion-images');
}

function unwrapValueEntries<T extends Record<string, unknown>>(collection: T | undefined): T {
  if (!collection) return {} as T;

  const normalized = Object.fromEntries(
    Object.entries(collection).map(([key, entry]) => {
      if (!entry || typeof entry !== 'object') {
        return [key, entry];
      }

      const outer = entry as Record<string, unknown>;
      const nested = outer.value;

      if (nested && typeof nested === 'object' && 'value' in (nested as Record<string, unknown>)) {
        const nestedRecord = nested as Record<string, unknown>;

        return [
          key,
          {
            ...outer,
            ...(typeof nestedRecord.role === 'string' ? { role: nestedRecord.role } : {}),
            value: nestedRecord.value,
          },
        ];
      }

      return [key, entry];
    })
  );

  return normalized as T;
}

function normalizeRecordMap(recordMap: Partial<ExtendedRecordMap>): ExtendedRecordMap {
  return {
    ...recordMap,
    block: unwrapValueEntries(recordMap.block),
    collection: unwrapValueEntries(recordMap.collection),
    collection_view: unwrapValueEntries(recordMap.collection_view),
    notion_user: unwrapValueEntries(recordMap.notion_user),
    collection_query: recordMap.collection_query ?? {},
    signed_urls: recordMap.signed_urls ?? {},
  };
}

function mergeRecordMapBlocks(
  recordMap: ExtendedRecordMap,
  incoming: ExtendedRecordMap
): ExtendedRecordMap {
  return {
    ...recordMap,
    block: {
      ...(recordMap.block ?? {}),
      ...(incoming.block ?? {}),
    },
    collection: {
      ...(recordMap.collection ?? {}),
      ...(incoming.collection ?? {}),
    },
    collection_view: {
      ...(recordMap.collection_view ?? {}),
      ...(incoming.collection_view ?? {}),
    },
    notion_user: {
      ...(recordMap.notion_user ?? {}),
      ...(incoming.notion_user ?? {}),
    },
  };
}

async function hydrateMissingBlocks(recordMap: ExtendedRecordMap): Promise<ExtendedRecordMap> {
  let hydrated = recordMap;

  while (true) {
    const missingBlockIds = getPageContentBlockIds(hydrated).filter((id) => !hydrated.block?.[id]);
    if (!missingBlockIds.length) {
      return hydrated;
    }

    let loadedAny = false;

    for (let i = 0; i < missingBlockIds.length; i += BLOCKS_FETCH_CHUNK_SIZE) {
      const chunk = missingBlockIds.slice(i, i + BLOCKS_FETCH_CHUNK_SIZE);
      const fetchedResponse = await notion.getBlocks(chunk);
      const fetched = normalizeRecordMap(
        'recordMap' in fetchedResponse ? fetchedResponse.recordMap : fetchedResponse
      );
      const fetchedBlockIds = Object.keys(fetched.block ?? {});

      if (!fetchedBlockIds.length) {
        continue;
      }

      loadedAny = true;
      hydrated = mergeRecordMapBlocks(hydrated, fetched);
    }

    if (!loadedAny) {
      console.warn(
        `[notion] Unable to resolve ${missingBlockIds.length} missing blocks: ${missingBlockIds.join(', ')}`
      );
      return hydrated;
    }
  }
}

async function getNormalizedPage(pageId: string): Promise<ExtendedRecordMap> {
  const recordMap = await hydrateMissingBlocks(
    normalizeRecordMap(
      await notion.getPage(pageId, {
        fetchMissingBlocks: false,
        signFileUrls: false,
      })
    )
  );

  await notion.addSignedUrls({
    recordMap,
    contentBlockIds: getPageContentBlockIds(recordMap),
  });

  return recordMap;
}

function ensureOutputDir(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function normalizeExtFromUrl(rawUrl: string, fallback = 'png'): string {
  try {
    const parsed = new URL(rawUrl);
    const ext = path.extname(parsed.pathname).replace('.', '').toLowerCase();
    if (ext) return ext;
  } catch {
    // Ignore URL parsing failures and fallback below.
  }
  return fallback;
}

function tokenToFilename(token: string): string {
  const digest = crypto.createHash('md5').update(token).digest('hex').slice(0, 12);
  const ext = normalizeExtFromUrl(token);
  return `${digest}.${ext}`;
}

function buildNotionImageProxyUrl(rawUrl: string, blockId: string): string {
  return `https://www.notion.so/image/${encodeURIComponent(rawUrl)}?table=block&id=${blockId}&cache=v2`;
}

async function downloadFile(
  urls: string[],
  outputDir: string,
  key: string
): Promise<string | null> {
  const filename = tokenToFilename(key);
  const filepath = path.join(outputDir, filename);

  if (fs.existsSync(filepath)) {
    return `${LOCAL_IMAGE_ORIGIN}/notion-images/${filename}`;
  }

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[notion] Failed to download image (${response.status}): ${url}`);
        continue;
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filepath, bytes);
      return `${LOCAL_IMAGE_ORIGIN}/notion-images/${filename}`;
    } catch (error) {
      console.warn(`[notion] Failed to download image: ${url}`, error);
    }
  }

  return null;
}

async function replaceNotionImagesWithLocal(recordMap: ExtendedRecordMap): Promise<ExtendedRecordMap> {
  const outputDir = getOutputDir();
  ensureOutputDir(outputDir);

  const replacements = new Map<string, string>();
  const signedUrls = recordMap.signed_urls ?? {};
  const signedUrlValues = Object.values(signedUrls);

  for (const [blockId, blockData] of Object.entries(recordMap.block ?? {})) {
    const block = blockData?.value;
    if (!block) continue;

    const source = block.properties?.source?.[0]?.[0];
    const displaySource = block.format?.display_source;
    const icon = block.format?.page_icon ?? block.format?.icon;

    const candidates = [source, displaySource, icon];

    for (const candidate of candidates) {
      if (typeof candidate !== 'string' || !candidate) continue;

      if (candidate.startsWith('attachment:')) {
        const signedUrl = signedUrls[blockId];
        if (!signedUrl) continue;
        if (!replacements.has(candidate)) {
          const localPath = await downloadFile([signedUrl], outputDir, candidate);
          if (localPath) replacements.set(candidate, localPath);
        }
      } else if (candidate.startsWith('https://file.notion.so/') || candidate.includes('amazonaws.com')) {
        if (!replacements.has(candidate)) {
          const fallbackProxyUrl = buildNotionImageProxyUrl(candidate, blockId);
          const localPath = await downloadFile([candidate, fallbackProxyUrl], outputDir, candidate);
          if (localPath) replacements.set(candidate, localPath);
        }
      }
    }
  }

  for (const signedUrl of signedUrlValues) {
    if (!signedUrl || replacements.has(signedUrl)) continue;
    const localPath = await downloadFile([signedUrl], outputDir, signedUrl);
    if (localPath) replacements.set(signedUrl, localPath);
  }

  let json = JSON.stringify(recordMap);
  for (const [from, to] of replacements) {
    json = json.split(from).join(to);
  }

  return JSON.parse(json) as ExtendedRecordMap;
}

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  const recordMap = await getNormalizedPage(pageId);

  if (process.env.NODE_ENV === 'production' || process.env.DOWNLOAD_IMAGES === 'true') {
    return replaceNotionImagesWithLocal(recordMap);
  }

  return recordMap;
}
