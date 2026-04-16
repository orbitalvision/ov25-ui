import React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn } from '../utils/cn.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';


const Name: React.FC = () => {
  const { range, currentProduct } = useOV25UI();
  const name =  currentProduct?.name ? (range?.name + '-' + currentProduct?.name) :  range?.name
  
  return (
    <Ov25ShadowHost style={{ display: 'block', width: '100%' }}>
      <div id="ov25-configurator-name" className={cn("ov:flex ov:flex-col ov:gap-2 ")}>
        <h1 className="ov:text-3xl ov:text-(--ov25-configurator-title-text-color)">{name}</h1>
      </div>
    </Ov25ShadowHost>
  )
}

export default Name