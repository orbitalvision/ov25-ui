import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';


const Name: React.FC = () => {
  const { range, currentProduct } = useOV25UI();
  const name =  currentProduct?.name ? (range?.name + '-' + currentProduct?.name) :  range?.name
  
  return (
    
    <div className={cn("ov:flex ov:flex-col ov:gap-2 ")}>
        <h1 className="ov:text-3xl ov:text-[var(--ov25-configurator-title-text-color)]">{name}</h1>
    </div>
  )
}

export default Name