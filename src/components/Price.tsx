import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';


const Price: React.FC = () => {
  const { formattedPrice, formattedSubtotal, discount, getString } = useOV25UI();
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
