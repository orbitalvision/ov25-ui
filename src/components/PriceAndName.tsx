import React from 'react'
import { cn } from "../utils/cn.js"
import { useOV25UI } from "../contexts/ov25-ui-context.js"

interface PriceAndNameProps {
  showName?: boolean
  showPrice?: boolean
  className?: string
}

const PriceAndName: React.FC<PriceAndNameProps> = ({
  showName = true,
  showPrice = true,
  className,
}) => {
  const { range, currentProduct, price } = useOV25UI();
  const name =  currentProduct?.name ?? range?.name
  
  return (
    <div className={cn("orbitalvision:flex orbitalvision:flex-col orbitalvision:gap-2 ", className)}>
      {showName && name && (
        <h1 className="orbitalvision:text-3xl orbitalvision:text-[var(--ov25-configurator-title-text-color)]">{name}</h1>
      )}
      {showPrice && price && (
        <p className="orbitalvision:text-2xl orbitalvision:text-[var(--ov25-configurator-price-text-color)]">£{(price / 100).toFixed(2)}</p>
      )}
    </div>
  )
}

export default PriceAndName 