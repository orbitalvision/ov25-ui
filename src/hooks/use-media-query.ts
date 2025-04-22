import * as React from "react"
    

export function useMediaQuery(breakpoint: number) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(true)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
