import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE = '/tests/sheet-reflow-debug.html';
const VIEWPORT = { width: 1440, height: 900 };
const RUNTIME_TIMEOUT = 20000;

type RectSnapshot = {
  left: number;
  right: number;
  width: number;
};

type PageLayoutSnapshot = RectSnapshot & {
  bodyWidth: number;
};

async function rectSnapshot(locator: Locator): Promise<RectSnapshot> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width };
  });
}

async function expectOpenSheetGeometry(
  page: Page,
  layoutBeforeOpen: PageLayoutSnapshot,
  scrollbarWidth: number,
): Promise<void> {
  await expect(page.locator('body')).toHaveCSS('position', 'fixed', {
    timeout: RUNTIME_TIMEOUT,
  });

  await expect
    .poll(
      () =>
        page.evaluate(
          ({ baseline, reservedWidth }) => {
            const shell = document
              .querySelector('.sheet-reflow-debug-shell')
              ?.getBoundingClientRect();
            const host = document
              .querySelector('#ov25-variants-shadow-container')
              ?.getBoundingClientRect();
            const sheet = document
              .querySelector('#ov25-variants-shadow-container')
              ?.shadowRoot?.querySelector('#ov25-configurator-variant-menu-container')
              ?.getBoundingClientRect();
            const body = document.body.getBoundingClientRect();
            if (!shell || !host || !sheet) return null;

            const close = (actual: number, expected: number, tolerance = 1) =>
              Math.abs(actual - expected) <= tolerance;

            return {
              scrollbarWasRemoved:
                document.documentElement.clientWidth === window.innerWidth,
              rootGutterWasRemoved:
                getComputedStyle(document.documentElement).scrollbarGutter === 'auto',
              bodyKeptOriginalWidth: close(body.width, baseline.bodyWidth),
              shellStayedStill:
                close(shell.left, baseline.left) &&
                close(shell.right, baseline.right) &&
                close(shell.width, baseline.width),
              hostReachesViewport: close(host.right, window.innerWidth),
              sheetReachesViewport: close(sheet.right, window.innerWidth),
              sheetWidthIsStable: close(sheet.width, 384),
              reservedScrollbarWasReal: reservedWidth > 0,
            };
          },
          {
            baseline: layoutBeforeOpen,
            reservedWidth: scrollbarWidth,
          },
        ),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toEqual({
      scrollbarWasRemoved: true,
      rootGutterWasRemoved: true,
      bodyKeptOriginalWidth: true,
      shellStayedStill: true,
      hostReachesViewport: true,
      sheetReachesViewport: true,
      sheetWidthIsStable: true,
      reservedScrollbarWasReal: true,
    });
}

test('desktop sheet reaches the viewport edge without reflowing the client page', async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto(FIXTURE);
  await page.evaluate(() => {
    document.body.style.setProperty('margin', '8px 11px 7px 5px', 'important');
    document.body.style.setProperty('box-sizing', 'content-box', 'important');
    document.documentElement.style.setProperty('scrollbar-gutter', 'auto', 'important');
  });

  const configure = page.getByRole('button', { name: 'Configure', exact: true });
  await expect(configure).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  const shell = page.locator('.sheet-reflow-debug-shell');
  const shellBeforeOpen = await rectSnapshot(shell);
  const bodyWidthBeforeOpen = await page.evaluate(
    () => document.body.getBoundingClientRect().width,
  );
  const layoutBeforeOpen = {
    ...shellBeforeOpen,
    bodyWidth: bodyWidthBeforeOpen,
  };
  const scrollbarWidth = await page.evaluate(
    () => window.innerWidth - document.documentElement.clientWidth,
  );
  test.skip(scrollbarWidth <= 0, 'This browser uses overlay scrollbars with no reserved gutter');

  await configure.click();
  await expectOpenSheetGeometry(
    page,
    layoutBeforeOpen,
    scrollbarWidth,
  );

  const close = page.getByRole('button', { name: 'Close', exact: true });
  await close.click();
  await expect(page.locator('body')).not.toHaveCSS('position', 'fixed', {
    timeout: RUNTIME_TIMEOUT,
  });
  await expect.poll(() => rectSnapshot(shell)).toEqual(shellBeforeOpen);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        bodyMargin: document.body.style.getPropertyValue('margin'),
        bodyMarginPriority: document.body.style.getPropertyPriority('margin'),
        bodyBoxSizing: document.body.style.getPropertyValue('box-sizing'),
        bodyBoxSizingPriority: document.body.style.getPropertyPriority('box-sizing'),
        htmlScrollbarGutter:
          document.documentElement.style.getPropertyValue('scrollbar-gutter'),
        htmlScrollbarGutterPriority:
          document.documentElement.style.getPropertyPriority('scrollbar-gutter'),
      })),
    )
    .toEqual({
      bodyMargin: '8px 11px 7px 5px',
      bodyMarginPriority: 'important',
      bodyBoxSizing: 'content-box',
      bodyBoxSizingPriority: 'important',
      htmlScrollbarGutter: 'auto',
      htmlScrollbarGutterPriority: 'important',
    });

  await configure.click();
  await expectOpenSheetGeometry(
    page,
    layoutBeforeOpen,
    scrollbarWidth,
  );

  await close.click();
  await expect(page.locator('body')).not.toHaveCSS('position', 'fixed', {
    timeout: RUNTIME_TIMEOUT,
  });
  await expect.poll(() => rectSnapshot(shell)).toEqual(shellBeforeOpen);
});
