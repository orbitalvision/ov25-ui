import {expect,test} from '@playwright/test';

test('mobile fallback follows loaded content instead of retaining the skeleton hit area',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='localhost'?route.continue():route.abort());
  await page.goto('/tests/sticky-mobile-loading-regression.html');
  await expect(page.locator('#result')).toContainText('Ready');
  const host=page.locator('#host');
  await expect.poll(()=>host.evaluate(e=>e.getBoundingClientRect().height)).toBe(455);
  await expect.poll(()=>page.locator('[data-ov25-sticky-placeholder]').evaluate(e=>e.getBoundingClientRect().height)).toBe(455);
  expect(await host.evaluate(e=>e.matches(':popover-open'))).toBe(true);
  expect(await host.evaluate(e=>e.style.height)).toBe('auto');
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  const title=await page.locator('h1').boundingBox();
  const gallery=await host.boundingBox();
  expect(title!.y-gallery!.y-gallery!.height).toBeLessThan(60);
  expect(title!.y).toBeGreaterThanOrEqual(gallery!.y+gallery!.height);
  await page.locator('#fabric').click();
  await expect(page.locator('#fabric')).toHaveText('Fabric selected');
  await expect(page.locator('.ov25-inline-sticky-gallery-root-mobile')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await page.screenshot({path:'/tmp/ov25-mobile-sticky-fixed.png'});
  await page.locator('#reload').click();
  await expect.poll(()=>host.evaluate(e=>e.getBoundingClientRect().height)).toBe(784);
  await expect.poll(()=>host.evaluate(e=>e.getBoundingClientRect().height)).toBe(455);
  await expect.poll(()=>page.locator('[data-ov25-sticky-placeholder]').evaluate(e=>e.getBoundingClientRect().height)).toBe(455);
});
