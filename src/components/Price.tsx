import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';


const Price: React.FC = () => {
  const { formattedPrice, formattedSubtotal, discount, hasReceivedPrice, getString } = useOV25UI();
  const priceText = getString(
    'priceValue',
    {
      PRICE: formattedPrice,
      SUBTOTAL: formattedSubtotal,
      DISCOUNT_AMOUNT: discount.formattedAmount,
      DISCOUNT_PERCENTAGE: discount.percentage,
    },
    formattedPrice,
  );
  const subtotalText = getString(
    'priceSubtotal',
    {
      SUBTOTAL: formattedSubtotal,
      PRICE: formattedPrice,
      DISCOUNT_AMOUNT: discount.formattedAmount,
      DISCOUNT_PERCENTAGE: discount.percentage,
    },
    formattedSubtotal,
  );
  const savingsAmountText = getString(
    'priceSavingsAmount',
    {
      DISCOUNT_AMOUNT: discount.formattedAmount,
      PRICE: formattedPrice,
      SUBTOTAL: formattedSubtotal,
      DISCOUNT_PERCENTAGE: discount.percentage,
    },
    discount.formattedAmount,
  );
  const savingsPercentageText = getString(
    'priceSavingsPercentage',
    {
      DISCOUNT_PERCENTAGE: discount.percentage,
      PRICE: formattedPrice,
      SUBTOTAL: formattedSubtotal,
      DISCOUNT_AMOUNT: discount.formattedAmount,
    },
    `${discount.percentage}%`,
  );
  const loadingText = getString('priceLoading', {}, 'Loading price');
  // Until the configurator reports a price, every price field is a placeholder zero. Rendering it
  // would read as a genuine "0.00" in the slot where the theme's own price used to be, so show the
  // same skeleton the Shopify price block paints before this component takes over.
  if (!hasReceivedPrice) {
    return (
      <Ov25ShadowHost id="ov25-configurator-price-container" style={{ display: 'block', width: '100%' }}>
        {/* The skeleton is the real price element — same tag, id, wrapper and classes — rather than
            a box sized to guess at it. The host slot inherits the page's configured font size
            while the price renders at ov:text-2xl (24px/32px), and merchant CSS from cssString is
            adopted into this shadow root and can target #ov25-price-product-page directly. Neither
            is knowable up front, so reserving the line box by rendering the element itself is the
            only way to guarantee the price drops in without shifting layout. */}
        <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
          <p
            id="ov25-price-product-page"
            className="ov:text-2xl ov:text-(--ov25-configurator-price-text-color) ov:relative ov:w-[5em]"
            role="status"
            aria-busy="true"
          >
            {/* Zero-width space: paints nothing, but establishes the price's real line box. */}
            <span aria-hidden="true">{'​'}</span>
            <span
              aria-hidden="true"
              className="ov25-price-skeleton__bar ov25-price-skeleton__bar--overlay"
            />
            <span className="ov:sr-only">{loadingText}</span>
          </p>
        </div>
      </Ov25ShadowHost>
    );
  }

  return (
    <Ov25ShadowHost id="ov25-configurator-price-container" style={{ display: 'block', width: '100%' }}>
      {discount.percentage > 0 && formattedPrice !== formattedSubtotal ? (
        <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
          <h3 id="ov25-subtotal-product-page" className='ov:text-md ov:px-2 ov:text-red-500 text-center ov:line-through'>{subtotalText}</h3>
          <h3 id="ov25-savings-amount-product-page" className='ov:text-md ov:hidden  text-center ov:px-2 ov:text-(--ov25-text-color)'>{savingsAmountText}</h3>
          <h3 id="ov25-savings-percentage-product-page" className='ov:text-md ov:hidden text-center ov:px-2 ov:text-(--ov25-text-color)'>{savingsPercentageText}</h3>
          <p id="ov25-price-product-page" className="ov:text-2xl ov:text-(--ov25-configurator-price-text-color)" data-sale="true">{priceText}</p>
        </div>
      ) : (
        <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
          <p id="ov25-price-product-page" className="ov:text-2xl ov:text-(--ov25-configurator-price-text-color)">{priceText}</p>
        </div>
      )}
    </Ov25ShadowHost>
  )
}

export default Price
