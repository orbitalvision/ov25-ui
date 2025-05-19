import {useRef } from "react"
import * as React from 'react'

const OVLogo = () => {
    const circleRef = useRef<HTMLDivElement>(null)
    const triangleRef = useRef<HTMLDivElement>(null)

    return (
      <div className="orbitalvision-flex orbitalvision-flex-col orbitalvision-items-center orbitalvision-justify-center orbitalvision-p-12 orbitalvision-px-16 orbitalvision-pr-[4.2rem] ">
        <div className="orbitalvision-relative orbitalvision-flex orbitalvision-flex-row orbitalvision-items-center orbitalvision-justify-center">
          <div 
            ref={circleRef}
            className="orbitalvision-w-[6.25rem] orbitalvision-h-[6.25rem] orbitalvision-rounded-full orbitalvision-bg-black "
          ></div>

          <div
            ref={triangleRef}
            className="orbitalvision-w-0 orbitalvision-h-0 orbitalvision-border-l-[55px] orbitalvision-border-r-[55px] orbitalvision-border-t-[96px] orbitalvision-border-l-transparent orbitalvision-border-r-transparent orbitalvision-border-t-black "
          ></div>
        </div>
      </div>
    )
  }
  
export default OVLogo