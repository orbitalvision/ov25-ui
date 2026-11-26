import { expect, test, type Page } from '@playwright/test';

async function openFixture(page: Page, mobile: boolean, canMove = true, query = '') {
  await page.setViewportSize(mobile ? { width: 390, height: 667 } : { width: 1440, height: 900 });
  await page.addInitScript((canMove) => {
    if (!canMove) Object.defineProperty(Element.prototype, 'moveBefore', { value: undefined });
    const show = HTMLElement.prototype.showPopover;
    HTMLElement.prototype.showPopover = function () {
      if (this.id === 'gallery') document.body.dataset.galleryPopover = 'called';
      return show.call(this);
    };
  }, canMove);
  await page.goto('/tests/inline-sticky-savor.html' + query);
  const iframe = page.frameLocator('iframe');
  await iframe.locator('img[alt="Sofa"]').waitFor();
  await iframe.locator('body').evaluate(body => body.dataset.session = 'original');
  return iframe;
}

async function scrollProduct(page: Page, mobile: boolean, y: number) {
  await page.evaluate(({ mobile, y }) => {
    (mobile ? window : document.querySelector('.page-wrapper')!).scrollTo(0, y);
  }, { mobile, y });
}

for (const mobile of [true, false]) {
  test(`Savor ${mobile ? 'mobile' : 'desktop'} keeps consent clickable and releases the original viewer at the boundary`, async ({ page }) => {
    const iframe = await openFixture(page, mobile);
    const gallery = page.locator('#gallery');
    const track = page.locator('[data-ov25-sticky-body-layer] > #gallery');
    const button = page.getByRole('button', { name: 'Decline cookies' });
    await button.click({ trial: true });
    await expect(track).toHaveCount(0);
    await scrollProduct(page, mobile, 200);
    await expect(gallery.locator('..')).toHaveCSS('position', 'sticky');
    await expect(track).toHaveCount(0);
    await expect.poll(() => gallery.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(16);
    const overlapsViewer = await button.evaluate(el => {
      const button = el.getBoundingClientRect();
      const viewer = document.querySelector('iframe')!.getBoundingClientRect();
      const x = button.x + button.width / 2, y = button.y + button.height / 2;
      return x > viewer.left && x < viewer.right && y > viewer.top && y < viewer.bottom;
    });
    expect(overlapsViewer).toBe(true);
    await button.click();
    await expect(button).toBeHidden();
    await scrollProduct(page, mobile, 400);
    await expect.poll(() => gallery.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(16);
    const boundaryBottom = await page.locator('#product').evaluate(el => el.getBoundingClientRect().bottom);
    await scrollProduct(page, mobile, 400 + boundaryBottom + 20);
    await expect.poll(() => gallery.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    await scrollProduct(page, mobile, 0);
    await expect.poll(() => gallery.evaluate(el =>
      Math.abs(el.getBoundingClientRect().top - document.querySelector('.product-information__media')!.getBoundingClientRect().top),
    )).toBeLessThanOrEqual(1);
    await expect(iframe.locator('body')).toHaveAttribute('data-session', 'original');
    await expect(page.locator('body')).not.toHaveAttribute('data-gallery-popover', 'called');
  });
}

test('Savor without moveBefore still pins the original viewer in place', async ({ page }) => {
  const iframe = await openFixture(page, true, false);
  await scrollProduct(page, true, 600);
  await expect.poll(() => page.locator('#gallery').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(16);
  await expect(page.locator('.product-information__media > #gallery')).toHaveCount(1);
  await expect(page.locator('[data-ov25-sticky-body-layer], [data-ov25-sticky-placeholder]')).toHaveCount(0);
  await expect(iframe.locator('body')).toHaveAttribute('data-session', 'original');
  await expect(page.locator('body')).not.toHaveAttribute('data-gallery-popover', 'called');
  await page.getByRole('button', { name: 'Decline cookies' }).click();
});

test('a wrapper with other visible content retains the popover fallback', async ({ page }) => {
  await openFixture(page, true);
  await page.locator('.product-information__media').evaluate(media => {
    media.appendChild(document.createTextNode('Product caption'));
  });
  await scrollProduct(page, true, 400);
  await expect(page.locator('#gallery')).toHaveAttribute('popover', 'manual');
  await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(0);
});

test('desktop waits for product options to supply native travel during loading', async ({ page }) => {
  const iframe = await openFixture(page, false, true, '?loading');
  await scrollProduct(page, false, 200);
  await page.locator('#options').evaluate(el => el.style.removeProperty('min-height'));
  await scrollProduct(page, false, 400);
  await expect.poll(() => page.locator('#gallery').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(16);
  await expect(page.locator('body')).not.toHaveAttribute('data-gallery-popover', 'called');
  await expect(iframe.locator('body')).toHaveAttribute('data-session', 'original');
});

test('the layout controller does not stretch an active native gallery wrapper while scrolling', async ({ page }) => {
  await openFixture(page, true);
  await scrollProduct(page, true, 200);
  const wrapper = page.locator('.product-information__media');
  await expect(wrapper).toHaveCSS('position', 'sticky');
  await wrapper.evaluate(element => {
    const target = element as HTMLElement;
    const changes: string[] = [];
    (window as unknown as { wrapperStyleChanges: string[] }).wrapperStyleChanges = changes;
    new MutationObserver(records => records.forEach(record => {
      if (record.oldValue) changes.push(record.oldValue);
    })).observe(target, { attributes: true, attributeFilter: ['style'], attributeOldValue: true });
  });
  for (const position of [300, 500, 700, 350, 100]) {
    await scrollProduct(page, true, position);
    await page.waitForTimeout(150);
  }
  const styles = await page.evaluate(
    () => (window as unknown as { wrapperStyleChanges: string[] }).wrapperStyleChanges,
  );
  expect(styles.filter(style => style.includes('align-self: stretch'))).toEqual([]);
  await expect(wrapper).toHaveCSS('align-self', 'start');
  await expect(page.locator('body')).not.toHaveAttribute('data-gallery-popover', 'called');
});


test('a header that scrolls with the product does not drive native sticky top changes', async ({ page }) => {
  await openFixture(page, true, true, '?flow-header');
  const wrapper = page.locator('.product-information__media');
  await expect(wrapper).toHaveCSS('position', 'sticky');
  await expect(wrapper).toHaveCSS('top', '16px');
  await scrollProduct(page, true, 200);
  await expect.poll(() => page.locator('#gallery').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(16);
  await expect(wrapper).toHaveCSS('top', '16px');
  await scrollProduct(page, true, 0);
  await expect(wrapper).toHaveCSS('top', '16px');
});


test('a fixed header retains its offset for the native gallery wrapper', async ({ page }) => {
  await openFixture(page, true, true, '?flow-header&fixed-header');
  const wrapper = page.locator('.product-information__media');
  await expect(wrapper).toHaveCSS('top', '76px');
  await scrollProduct(page, true, 300);
  await expect.poll(() => page.locator('#gallery').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(76);
});


test('native gallery remains stable after crossing the end of a long product', async ({ page }) => {
  const iframe = await openFixture(page, true, true, '?negative-margin');
  const wrapper = page.locator('.product-information__media');
  await scrollProduct(page, true, 200);
  await expect(wrapper).toHaveCSS('position', 'sticky');
  await wrapper.evaluate(element => {
    const changes: string[] = [];
    (window as unknown as { boundaryStyleChanges: string[] }).boundaryStyleChanges = changes;
    new MutationObserver(records => records.forEach(record => {
      if (record.oldValue !== null) changes.push(record.oldValue);
    })).observe(element, { attributes: true, attributeFilter: ['style'], attributeOldValue: true });
  });

  const bottom = await page.locator('#product').evaluate(element => element.getBoundingClientRect().bottom);
  await scrollProduct(page, true, 200 + bottom + 30);
  await page.waitForTimeout(1000);
  await expect(wrapper).toHaveCSS('position', 'sticky');
  await expect.poll(() => page.locator('#gallery').evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  const changes = await page.evaluate(
    () => (window as unknown as { boundaryStyleChanges: string[] }).boundaryStyleChanges,
  );
  expect(changes.filter(value => !value.includes('position: sticky'))).toEqual([]);
  await expect(iframe.locator('body')).toHaveAttribute('data-session', 'original');

  await scrollProduct(page, true, 400);
  await expect.poll(() => page.locator('#gallery').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(16);
});

test('the mobile product keeps its row gap and returns to desktop columns', async ({ page }) => {
  const iframe = await openFixture(page, true);
  const product = page.locator('#product');
  const details = page.locator('#options');
  await expect(product).toHaveCSS('display', 'block');
  const gap = await details.evaluate(el =>
    el.getBoundingClientRect().top - el.previousElementSibling!.getBoundingClientRect().bottom,
  );
  expect(gap).toBeCloseTo(24, 0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(product).toHaveCSS('display', 'grid');
  await expect(details).toHaveCSS('margin-block-start', '0px');
  await expect.poll(() => details.evaluate(el =>
    Math.round(el.getBoundingClientRect().top - el.previousElementSibling!.getBoundingClientRect().top),
  )).toBe(0);
  await expect(iframe.locator('body')).toHaveAttribute('data-session', 'original');
});
