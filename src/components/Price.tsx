import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';


const Price: React.FC = () => {
  const { formattedPrice, formattedSubtotal, discount } = useOV25UI();
  return (
    <Ov25ShadowHost style={{ display: 'block', width: '100%' }}>
      {discount.percentage > 0 && formattedPrice !== formattedSubtotal ? (
    <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
     <h3 id="ov25-subtotal-product-page" className='ov:text-md ov:px-2 ov:text-red-500 text-center ov:line-through'>{formattedSubtotal}</h3>
     <h3 id="ov25-savings-amount-product-page" className='ov:text-md ov:hidden  text-center ov:px-2 ov:text-(--ov25-text-color)'>{discount.formattedAmount}</h3>
     <h3 id="ov25-savings-percentage-product-page" className='ov:text-md ov:hidden text-center ov:px-2 ov:text-(--ov25-text-color)'>{discount.percentage}%</h3>
      <p id="ov25-price-product-page" className="ov:text-2xl ov:text-(--ov25-configurator-price-text-color)" data-sale="true">{formattedPrice}</p>
    </div>
    ) : (
      <div className={cn("ov:flex ov:items-center ov:gap-2 ")}>
        <p id="ov25-price-product-page" className="ov:text-2xl ov:text-(--ov25-configurator-price-text-color)">{formattedPrice}</p>
      </div>
    )}
    </Ov25ShadowHost>
  )
}

export default Price