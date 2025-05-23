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
        'ov:flex ov:justify-between ov:w-full ov:p-3 ov:py-2 ov:my-2 ov:cursor-pointer',
        'ov:bg-[var(--ov25-primary-color)]',
        'ov:hover:bg-[var(--ov25-button-hover-background-color)]',
        'ov:text-[var(--ov25-button-text-color)]',
        'ov:hover:text-[var(--ov25-button-hover-text-color)]',
        'ov:border-[length:var(--ov25-button-border-width)]',
        'ov:border-[var(--ov25-button-border-color)]',
        'ov:rounded-[var(--ov25-button-border-radius)]',
      )}
      data-ov25-variant-option={optionId}
    >
      <div className="ov:flex ov:flex-col ov:items-start ov:cursor-pointer ov:space-y-1.5 ov:text-left ov:pl-4">
        <span className="ov:text-[12px] ov:font-light ov:uppercase">{label}</span>
        <span className={`ov:text-base ${value === '' ? 'ov:invisible' : ''}`}>{value === '' ? '_' : value}</span>
      </div>
      <ChevronRight size={28} className="ov:h-12 ov:stroke-1 ov:stroke-muted-foreground ov:self-center"/>
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
      <div className="ov:overflow-hidden">
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

