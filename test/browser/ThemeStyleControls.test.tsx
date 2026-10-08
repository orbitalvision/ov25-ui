import { expect, test } from 'vitest';
import { getSharedStylesheet, createuserCustomCssStylesheet } from '../../src/utils/shadow-styles';

test('explicit palette controls reach styled shadow elements while legacy defaults remain unchanged', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = `
    <h1 class="ov:font-medium">Sofa</h1><p class="ov:font-normal">Body copy</p>
    <button class="ov25-cta ov:font-medium ov:uppercase ov:border-0 ov:focus-visible:outline-none"><span class="ov:font-light">Configure</span></button>
    <div class="ov25-default-variant-card" data-selected="true">
      <div class="ov25-variant-thumb-wrapper ov:p-[4px] ov:bg-[var(--ov25-highlight-color)]">
        <div class="ov25-selection-thumbnail ov:bg-white ov:w-16 ov:h-16"></div>
      </div>
      <span class="ov25-variant-name ov:text-(--ov25-text-color)">Linen</span>
    </div>
    <div class="ov25-size-variant-card ov:bg-[#F0F0F0]" data-selected="true"><span class="ov25-size-variant-card-name ov:text-(--ov25-secondary-text-color)">Large</span></div>
    <div id="ov25-option-selector-tabs"><button data-selected="true">Fabrics</button></div>
    <input class="ov:text-(--ov25-secondary-text-color) ov:bg-transparent" placeholder="Search" />
    <div data-ov25-themed-backdrop class="ov:bg-black/50"></div>`;
  shadow.adoptedStyleSheets = [getSharedStylesheet()];
  const button = shadow.querySelector('button')!;
  const input = shadow.querySelector('input')!;
  const selected = shadow.querySelector('.ov25-default-variant-card')!;
  const caption = selected.querySelector('.ov25-variant-name')!;
  const size = shadow.querySelector('.ov25-size-variant-card')!;
  const selectedAppearance = () => [selected, caption, size, size.firstElementChild!].map(element => {
    const computed = getComputedStyle(element);
    return [computed.backgroundColor, computed.color, computed.borderTopColor, computed.boxShadow];
  });
  const buttonAppearance = () => {
    const computed = getComputedStyle(button);
    return ['backgroundColor', 'color', 'fontFamily', 'fontWeight', 'textTransform', 'borderTopWidth', 'borderRadius'].map(property => computed[property as keyof CSSStyleDeclaration]);
  };
  const baseline = buttonAppearance();
  const baselineSelection = selectedAppearance();
  shadow.adoptedStyleSheets = [getSharedStylesheet(), createuserCustomCssStylesheet(':host {--ov25-background-color: #ffffff;}')];
  expect(buttonAppearance()).toEqual(baseline);
  shadow.adoptedStyleSheets = [getSharedStylesheet(), createuserCustomCssStylesheet(`:host {
    --ov25-selected-background-color: #263b35;
    --ov25-selected-text-color: #ffffff;
    --ov25-selected-border-color: #263b35;
    --ov25-highlight-color: #263b35;
    --ov25-variant-thumb-ring-mode: solid;
    --ov25-cta-border-width: 2px;
    --ov25-cta-border-color: #aabbaa;
    --ov25-button-font-weight: 700;
    --ov25-focus-ring-color: #234567;
    --ov25-body-font-weight: 500;
    --ov25-button-text-transform: none;
    --ov25-input-background-color: #eeeeee;
    --ov25-input-text-color: #223344;
    --ov25-input-placeholder-color: #777777;
    --ov25-heading-font-family: Georgia, serif;
    --ov25-heading-font-weight: 700;
    --ov25-backdrop-color: #263b35;
    --ov25-backdrop-opacity: 0;
  }`)];
  button.focus();
  expect(getComputedStyle(button).outlineColor).toBe('rgb(35, 69, 103)');
  expect(getComputedStyle(button).outlineStyle).toBe('solid');
  expect(getComputedStyle(button).outlineWidth).toBe('2px');
  expect(getComputedStyle(button).borderTopWidth).toBe('2px');
  expect(getComputedStyle(button).borderTopColor).toBe('rgb(170, 187, 170)');
  expect(getComputedStyle(button).textTransform).toBe('none');
  expect(getComputedStyle(button).fontWeight).toBe('700');
  expect(getComputedStyle(button.firstElementChild!).fontWeight).toBe('700');
  expect(getComputedStyle(shadow.querySelector('p')!).fontWeight).toBe('500');
  expect(selectedAppearance()).toEqual(baselineSelection);
  const ring = selected.querySelector('.ov25-variant-thumb-wrapper')!;
  expect(getComputedStyle(ring).backgroundColor).toBe('rgb(38, 59, 53)');
  expect(getComputedStyle(ring).paddingTop).toBe('4px');
  const selectedTab = shadow.querySelector('#ov25-option-selector-tabs > button')!;
  expect(getComputedStyle(selectedTab).backgroundColor).toBe('rgb(38, 59, 53)');
  expect(getComputedStyle(selectedTab).color).toBe('rgb(255, 255, 255)');
  expect(getComputedStyle(input).backgroundColor).toBe('rgb(238, 238, 238)');
  expect(getComputedStyle(input).color).toBe('rgb(34, 51, 68)');
  expect(getComputedStyle(input, '::placeholder').color).toBe('rgb(119, 119, 119)');
  expect(getComputedStyle(shadow.querySelector('h1')!).fontWeight).toBe('700');
  expect(getComputedStyle(shadow.querySelector('h1')!).fontFamily).toBe('Georgia, serif');
  expect(getComputedStyle(shadow.querySelector('[data-ov25-themed-backdrop]')!).backgroundColor).toMatch(/\/ 0\)/);
  host.remove();
});
