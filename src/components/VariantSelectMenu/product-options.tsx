import { ChevronRight } from "lucide-react"
import React from "react"
interface ProductOptionsProps {
  label: string
  value: string
  onClick: () => void
}

interface ProductOptionsGroupProps {
  allOptions: any[]
  isMobile: boolean
  isVariantsOpen: boolean
  handleOptionClick: (optionId: any) => void
  range?: { name: string }
  getSelectedValue: (option: any) => string
}

export function ProductOptions({ label, value, onClick }: ProductOptionsProps) {
  return (
    <button
      onClick={(e) => {e.stopPropagation(), e.preventDefault(); onClick()}}
      className="flex justify-between w-full p-4 py-4 hover:bg-accent border-b last:border-b-0 border-[var(--ov25-configurator-variant-menu-border-color)]"
    >
      <div className="flex flex-col items-start space-y-1.5 text-left text-[#282828]">
        <span className="text-[12px] font-light uppercase  ">{label}</span>
        <span className={`text-base  ${value === '' ? 'invisible' : ''}`}>{value === '' ? '_' : value}</span>
      </div>
      <ChevronRight size={28} className=" h-12 stroke-1  stroke-muted-foreground self-center" />
    </button>
  )
}

export function ProductOptionsGroup({ 
  allOptions, 
  isMobile, 
  isVariantsOpen, 
  handleOptionClick, 
  range, 
  getSelectedValue 
}: ProductOptionsGroupProps) {
  return (
    <div
      className={`w-full duration-300 ease-in-out ${
        !isMobile && (isVariantsOpen ? "opacity-0 invisible translate-x-[-100%]" : "opacity-100 visible translate-x-0")
      }`}
    >
      <div className="border rounded-[var(--ov25-configurator-variant-menu-border-radius)] border-[var(--ov25-configurator-variant-menu-border-color)] overflow-hidden">
        {allOptions.map((option) => (
          <ProductOptions
            key={option?.id}
            label={'Select ' + option?.name}
            value={option?.name === 'size' ? (range?.name ? range.name + ' ' : '') + getSelectedValue(option) : getSelectedValue(option)}
            onClick={() => handleOptionClick(option?.id)}
          />
        ))}
      </div>
    </div>
  )
}

