import type { ExtendedRecordMap } from 'notion-types';

const MAIN_PORTFOLIO_PAGE_ID = 'b04fc9185da54bfb8bb916519ee689d7';

const CASE_HEADING_IDS = [
  '305ca434-1bfb-80c4-af56-e487ca994621',
  '305ca434-1bfb-80cd-8b84-dea53b07dac7',
  '305ca434-1bfb-8005-b9c2-db3ebb90b31c',
  '305ca434-1bfb-8030-8460-d56721d2a5fa',
] as const;

const CASE_NAVIGATION_IDS = [
  '305ca434-1bfb-800d-a50d-e98d4e5eaabf',
  '305ca434-1bfb-8094-abd2-cef104b8ed45',
  '305ca434-1bfb-80df-8d29-db5532c48d7c',
  '305ca434-1bfb-8071-b972-cf5853bbc636',
] as const;

const NEW_CASE_ORDER = [2, 3, 0, 1] as const;
const CASE_NUMBER_PATTERN = /^(\s*)\d+(\s+[Кк]ейс)(?=[\s.])/u;

function compactId(id: string): string {
  return id.replaceAll('-', '');
}

function getBlock(recordMap: ExtendedRecordMap, blockId: string) {
  const matchingId = Object.keys(recordMap.block).find(
    (candidate) => compactId(candidate) === compactId(blockId)
  );

  return matchingId ? recordMap.block[matchingId]?.value : undefined;
}

function formatCaseNumber(title: string, caseNumber: number): string {
  const renumberedTitle = title.replace(
    CASE_NUMBER_PATTERN,
    `$1${caseNumber}$2`
  );

  return caseNumber === 1
    ? renumberedTitle.replace(/^(\s*1\s+)Кейс/u, '$1кейс')
    : renumberedTitle;
}

function renumberCaseTitle(block: ReturnType<typeof getBlock>, caseNumber: number): void {
  const title = block?.properties?.title;
  if (!Array.isArray(title)) return;

  for (const decoration of title) {
    if (typeof decoration?.[0] !== 'string') continue;
    decoration[0] = formatCaseNumber(decoration[0], caseNumber);
  }
}

function reorderCaseNavigation(recordMap: ExtendedRecordMap): void {
  const navigationBlocks = CASE_NAVIGATION_IDS.map((id) => getBlock(recordMap, id));
  if (navigationBlocks.some((block) => !block)) return;

  const reorderedTitles = NEW_CASE_ORDER.map((sourceIndex, newIndex) => {
    const sourceTitle = navigationBlocks[sourceIndex]?.properties?.title;
    if (!Array.isArray(sourceTitle)) return undefined;

    const caseDecoration = structuredClone(sourceTitle).find(
      (decoration) =>
        typeof decoration?.[0] === 'string' &&
        CASE_NUMBER_PATTERN.test(decoration[0])
    );
    if (!caseDecoration || typeof caseDecoration[0] !== 'string') return undefined;

    caseDecoration[0] = formatCaseNumber(caseDecoration[0], newIndex + 1);

    return newIndex === 0 ? [['      '], caseDecoration] : [caseDecoration];
  });

  if (reorderedTitles.some((title) => !title)) return;

  navigationBlocks.forEach((block, index) => {
    if (block?.properties) {
      block.properties.title = reorderedTitles[index];
    }
  });
}

export function reorderMainPortfolioCases(
  recordMap: ExtendedRecordMap,
  pageId: string
): ExtendedRecordMap {
  if (compactId(pageId) !== MAIN_PORTFOLIO_PAGE_ID) return recordMap;

  const rootBlock = getBlock(recordMap, pageId);
  if (!rootBlock || !Array.isArray(rootBlock.content)) return recordMap;
  const content = rootBlock.content;

  const caseStartIndexes = CASE_HEADING_IDS.map((id) =>
    content.findIndex((contentId) => compactId(contentId) === compactId(id))
  );
  if (caseStartIndexes.some((index) => index < 0)) return recordMap;

  const lastCaseStart = caseStartIndexes.at(-1);
  if (lastCaseStart === undefined) return recordMap;

  const nextSectionOffset = content
    .slice(lastCaseStart + 1)
    .findIndex((id) => getBlock(recordMap, id)?.type === 'header');
  const casesEnd =
    nextSectionOffset === -1
      ? content.length
      : lastCaseStart + 1 + nextSectionOffset;

  const caseSections = caseStartIndexes.map((start, index) => {
    const end = caseStartIndexes[index + 1] ?? casesEnd;
    return content.slice(start, end);
  });

  const reorderedSections = NEW_CASE_ORDER.flatMap(
    (sourceIndex) => caseSections[sourceIndex]
  );
  rootBlock.content = [
    ...content.slice(0, caseStartIndexes[0]),
    ...reorderedSections,
    ...content.slice(casesEnd),
  ];

  NEW_CASE_ORDER.forEach((sourceIndex, newIndex) => {
    renumberCaseTitle(
      getBlock(recordMap, CASE_HEADING_IDS[sourceIndex]),
      newIndex + 1
    );
  });
  reorderCaseNavigation(recordMap);

  return recordMap;
}
