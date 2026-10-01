// Bound SVG work independently of the size of the dataset.
export const CHART_PAGE_SIZE = 200;

export function chartWindow<T>(data: T[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(data.length / CHART_PAGE_SIZE));
  const page = Math.max(0, Math.min(requestedPage, pageCount - 1));
  const start = page * CHART_PAGE_SIZE;
  return {
    page,
    pageCount,
    start,
    end: Math.min(start + CHART_PAGE_SIZE, data.length),
    data: data.slice(start, start + CHART_PAGE_SIZE),
  };
}
