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
        'flex justify-between w-full p-3 py-2 my-2 cursor-pointer',
        'bg-[var(--ov25-primary-color)]',
        'hover:bg-[var(--ov25-button-hover-background-color)]',
        'text-[var(--ov25-button-text-color)]',
        'hover:text-[var(--ov25-button-hover-text-color)]',
        'border-[length:var(--ov25-button-border-width)]',
        'border-[var(--ov25-button-border-color)]',
        'rounded-[var(--ov25-button-border-radius)]',
      )}
      data-ov25-variant-option={optionId}
    >
      <div className="flex flex-col items-start cursor-pointer space-y-1.5 text-left pl-4">
        <span className="text-[12px] font-light uppercase">{label}</span>
        <span className={`text-base ${value === '' ? 'invisible' : ''}`}>{value === '' ? '_' : value}</span>
      </div>
      <ChevronRight size={28} className=" h-12 stroke-1 stroke-muted-foreground self-center"/>
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
      <div className="overflow-hidden">
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

