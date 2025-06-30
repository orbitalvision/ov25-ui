import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';


const Price: React.FC = () => {
  const { price, formattedSubtotal, discount } = useOV25UI();
  
  return (
    <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
     <h3 id="ov25-subtotal-product-page" className='ov:text-md ov:px-2 ov:text-red-500 text-center ov:line-through'>{formattedSubtotal}</h3>
     <h3 id="ov25-savings-amount-product-page" className='ov:text-md ov:hidden  text-center ov:px-2 ov:text-[var(--ov25-text-color)]'>{discount.formattedAmount}</h3>
     <h3 id="ov25-savings-percentage-product-page" className='ov:text-md ov:hidden text-center ov:px-2 ov:text-[var(--ov25-text-color)]'>{discount.percentage}%</h3>
      <p id="ov25-price-product-page" className="ov:text-2xl ov:text-[var(--ov25-configurator-price-text-color)]">£{(price / 100).toFixed(2)}</p>
    </div>
  )
}

export default Price