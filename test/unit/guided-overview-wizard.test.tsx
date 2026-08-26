import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WizardVariants } from '../../src/components/VariantSelectMenu/WizardVariants';

let wizardContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => wizardContext,
}));

vi.mock('../../src/components/VariantSelectMenu/VariantsContent.js', () => ({
  VariantsContent: ({ variantsToRender }: { variantsToRender: Array<{ id: string; name: string }> }) => (
    <>{variantsToRender.map((variant) => <button key={variant.id}>{variant.name}</button>)}</>
  ),
}));

vi.mock('../../src/components/VariantSelectMenu/variant-cards/VariantThumb.js', () => ({
  VariantThumb: () => <span aria-hidden>thumb</span>,
}));

vi.mock('../../src/components/VariantSelectMenu/FilterControls.js', () => ({ FilterControls: () => null }));
vi.mock('../../src/components/VariantSelectMenu/FilterContent.js', () => ({ FilterContent: () => null }));
vi.mock('../../src/components/VariantSelectMenu/Snap2ModulesOptionBody.js', () => ({ Snap2ModulesOptionBody: () => null }));
vi.mock('../../src/components/Snap2VariantSheetColumn.js', () => ({ Snap2VariantSheetColumn: ({ children }: React.PropsWithChildren) => children }));
vi.mock('../../src/components/VariantSelectMenu/VariantsCloseButton.js', () => ({
  VariantsCloseButton: ({ onClick, ariaLabel, className }: { onClick?: () => void; ariaLabel?: string; className?: string }) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel ?? 'Close'} className={className}>×</button>
  ),
}));

const options = [
  {
    id: 'size',
    name: 'Size',
    groups: [{ id: 'sizes', name: 'Sizes', selections: [{ id: 'sofa', name: 'Sofa', thumbnail: '' }] }],
  },
  {
    id: 'fabric',
    name: 'Fabric',
    groups: [{ id: 'plain', name: 'Plain', selections: [{ id: 'linen', name: 'Linen', thumbnail: '' }] }],
  },
];

function createContext() {
  return {
    variantPanelOptions: options,
    selectedSelections: [{ optionId: 'fabric', groupId: 'plain', selectionId: 'linen' }],
    handleSelectionSelect: vi.fn(),
    getSelectedValue: vi.fn(() => ''),
    range: { name: 'Oslo' },
    products: [{ id: 'sofa' }],
    currentProductId: 'sofa',
    applySearchAndFilters: (option: unknown) => option,
    buyNowFunction: vi.fn(),
    addToBasketFunction: vi.fn(),
    setIsVariantsOpen: vi.fn(),
    formattedPrice: '£1,499.00',
    formattedSubtotal: '£1,499.00',
    discount: { percentage: 0, amount: 0, formattedAmount: '£0.00' },
    hasReceivedPrice: true,
    isCheckoutPayloadReady: true,
    disableAddToCart: false,
    disableBuyNow: false,
    hidePricing: false,
    isSnap2Mode: false,
    activeOptionId: null,
    setActiveOptionId: vi.fn(),
    getString: (_key: string, _vars: Record<string, string> | undefined, fallback: string) => fallback,
  };
}

describe('guided-overview wizard', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      disconnect() {}
    });
    wizardContext = createContext();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens on Review with navigation and the standard combo checkout action', () => {
    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    const actions = document.querySelector('[data-ov25-guided-overview-actions]');
    const buyNowAction = document.querySelector('[data-ov25-guided-overview-action="buy-now"]');
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
    expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
    expect(actions).toHaveAttribute('data-ov25-guided-overview-has-buy-now', 'true');
    expect(actions).toHaveClass('ov:grid-cols-2');
    expect(buyNowAction).toHaveClass('ov:col-span-2');
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to basket' })).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-checkout-price-label]')).toHaveTextContent('£1,499.00');
    expect(screen.getByRole('button', { name: 'Size' })).toBeEnabled();
  });

  it('gives previous and next equal footer columns when pricing is hidden', () => {
    wizardContext.hidePricing = true;

    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    const actions = document.querySelector('[data-ov25-guided-overview-actions]');
    expect(actions).toHaveAttribute('data-ov25-guided-overview-has-buy-now', 'false');
    expect(actions).toHaveClass('ov:grid-cols-2');
    expect(document.querySelector('[data-ov25-guided-overview-action="buy-now"]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Size' })).toBeEnabled();
  });

  it('stays on Review when a sheet opens with an existing active option', () => {
    wizardContext = createContext();
    wizardContext.activeOptionId = 'size';

    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose Size' })).not.toBeInTheDocument();
  });

  it('nests the inline review step inside the constrained variants content panel', () => {
    render(<WizardVariants mode="inline" displayMode="guided-overview" />);

    const content = document.querySelector('[data-ov25-list-variants-content]');
    const review = document.querySelector('[data-ov25-guided-overview-review="true"]');

    expect(content).toBeInTheDocument();
    expect(review).toBeInTheDocument();
    expect(review?.parentElement).toBe(content);
  });

  it('opens an option editor and returns it to Review', () => {
    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    fireEvent.click(screen.getByRole('button', { name: /Fabric.*Linen/i }));

    expect(screen.getByRole('heading', { name: 'Choose Fabric' })).toBeInTheDocument();
    expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to review' }));

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it('cycles from Review through the options and back to Review from the footer', () => {
    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    fireEvent.click(screen.getByRole('button', { name: 'Size' }));
    expect(screen.getByRole('heading', { name: 'Choose Size' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Fabric' }));
    expect(screen.getByRole('heading', { name: 'Choose Fabric' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Size' }));
    expect(screen.getByRole('heading', { name: 'Choose Size' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it('resolves Guided Overview copy through string replacements', () => {
    wizardContext.getString = (key: string, vars: Record<string, string> | undefined, fallback: string = '') => {
      const values = vars ?? {};
      const replacements: Record<string, string> = {
        wizardReview: '▽Review cart▽',
        wizardPreviousButtonLabel: '▽Prev▽',
        wizardNextButtonLabel: '▽Next▽',
        wizardBackToReviewLabel: '▽Back to overview▽',
        wizardChooseOption: `▽Choose ${values.OPTION_NAME}▽`,
        wizardPreviousStep: `▽${values.STEP_LABEL} previous▽`,
        wizardNextStep: `▽${values.STEP_LABEL} next▽`,
        wizardReviewStepOption: `▽${values.OPTION_NAME}▽`,
        wizardReviewStepSelection: `▽${values.SELECTION_LABEL}▽`,
      };
      return replacements[key] ?? fallback;
    };

    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    expect(screen.getByRole('heading', { name: '▽Review cart▽' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /▽Fabric▽.*▽Linen▽/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '▽Prev▽' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '▽Size next▽' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /▽Fabric▽.*▽Linen▽/i }));

    expect(screen.getByRole('heading', { name: '▽Choose Fabric▽' })).toBeInTheDocument();
    const backToReview = screen.getByRole('button', { name: '▽Back to overview▽' });
    expect(backToReview).toBeInTheDocument();
    expect(backToReview.querySelector('.lucide-undo-2')).toBeInTheDocument();
  });

  it('exposes stable custom CSS hooks for the root, review, editor, and actions', () => {
    render(<WizardVariants mode="drawer" displayMode="guided-overview" />);

    expect(document.querySelector('[data-ov25-wizard-display-mode="guided-overview"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-header]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-review="true"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-ov25-guided-overview-review-row]')).toHaveLength(options.length);
    expect(document.querySelector('[data-ov25-guided-overview-review-part="thumbnail"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-review-part="option"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-review-part="selection"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-action="previous"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-action="buy-now"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ov25-guided-overview-action="next"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Fabric.*Linen/i }));

    expect(document.querySelector('[data-ov25-guided-overview-editor="fabric"]')).toBeInTheDocument();
    expect(document.querySelector('.ov25-guided-overview-back')).toBeInTheDocument();
  });
});
