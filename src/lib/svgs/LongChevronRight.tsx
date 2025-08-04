import React from "react"

export const LongChevronRight = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return <svg width="11" height="22" viewBox="0 0 11 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
    <path d="M1 21L10 11L1 1" stroke="#282828"/>
    </svg>
  })