
import { ChevronRight } from "lucide-react"
import React from "react"
interface ProductOptionsProps {
  label: string
  value: string
  onClick: () => void
}



export function ProductOptions({ label, value, onClick }: ProductOptionsProps) {
  return (
    <button
      onClick={onClick}
      className="grid grid-cols-[1fr,auto] w-full border-b border-x border-border p-4 py-4 first:border-t hover:bg-accent  first:rounded-t-[3px] last:rounded-b-[3px]"
    >
      <div className="flex flex-col items-start space-y-1.5 text-left text-[#282828]">
        <span className="text-[12px] font-light uppercase  ">{label}</span>
        <span className={`text-base  ${value === '' ? 'invisible' : ''}`}>{value === '' ? '_' : value}</span>
      </div>
      <ChevronRight className="h-4  stroke-muted-foreground self-center" />
    </button>
  )
}

