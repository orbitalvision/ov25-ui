import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';


const Price: React.FC = () => {
  const { price } = useOV25UI();
  
  return (
    <div className={cn("ov:flex ov:flex-col ov:gap-2 ")}>
      <p className="ov:text-2xl ov:text-[var(--ov25-configurator-price-text-color)]">£{(price / 100).toFixed(2)}</p>
    </div>
  )
}

export default Price