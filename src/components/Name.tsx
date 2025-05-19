import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';


const Name: React.FC = () => {
  const { range, currentProduct } = useOV25UI();
  const name =  currentProduct?.name ?? range?.name
  
  return (
    
    <div className={cn("orbitalvision:flex orbitalvision:flex-col orbitalvision:gap-2 ")}>
        <h1 className="orbitalvision:text-3xl orbitalvision:text-[var(--ov25-configurator-title-text-color)]">{name}</h1>
    </div>
  )
}

export default Name