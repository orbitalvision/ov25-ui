import { ChevronRight } from "lucide-react"
import React from "react"
import { cn } from "../../lib/utils.js"
interface ProductOptionsProps {
  label: string
  value: string
  optionId: string
  onClick: () => void
}

interface ProductOptionsGroupProps {
  allOptions: any[]
  handleOptionClick: (optionId: any) => void
  range?: { name: string }
  getSelectedValue: (option: any) => string
}

export function ProductOptions({ label, value, optionId, onClick }: ProductOptionsProps) {
  return (
    <button
      onClick={(e) => {e.stopPropagation(), e.preventDefault(); onClick()}}
      className={cn(
        'orbitalvision:flex orbitalvision:justify-between orbitalvision:w-full orbitalvision:p-3 orbitalvision:py-2 orbitalvision:my-2 orbitalvision:cursor-pointer',
        'orbitalvision:bg-[var(--ov25-primary-color)]',
        'orbitalvision:hover:bg-[var(--ov25-button-hover-background-color)]',
        'orbitalvision:text-[var(--ov25-button-text-color)]',
        'orbitalvision:hover:text-[var(--ov25-button-hover-text-color)]',
        'orbitalvision:border-[length:var(--ov25-button-border-width)]',
        'orbitalvision:border-[var(--ov25-button-border-color)]',
        'orbitalvision:rounded-[var(--ov25-button-border-radius)]',
      )}
      data-ov25-variant-option={optionId}
    >
      <div className="orbitalvision:flex orbitalvision:flex-col orbitalvision:items-start orbitalvision:cursor-pointer orbitalvision:space-y-1.5 orbitalvision:text-left orbitalvision:pl-4">
        <span className="orbitalvision:text-[12px] orbitalvision:font-light orbitalvision:uppercase">{label}</span>
        <span className={`orbitalvision:text-base ${value === '' ? 'orbitalvision:invisible' : ''}`}>{value === '' ? '_' : value}</span>
      </div>
      <ChevronRight size={28} className="orbitalvision:h-12 orbitalvision:stroke-1 orbitalvision:stroke-muted-foreground orbitalvision:self-center"/>
    </button>
  )
}

export function ProductOptionsGroup({
  allOptions,
  handleOptionClick,
  range, 
  getSelectedValue 
}: ProductOptionsGroupProps) {
  return (
    <div>
      <div className="orbitalvision:overflow-hidden">
        {allOptions.map((option) => (
          <ProductOptions
            key={option?.id}
            label={'Select ' + option?.name}
            value={option?.name === 'size' ? (range?.name ? range.name + ' ' : '') + getSelectedValue(option) : getSelectedValue(option)}
            optionId={option?.id}
            onClick={() => handleOptionClick(option?.id)}
          />
        ))}
      </div>
    </div>
  )
}

