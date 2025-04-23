import {useRef } from "react"
import * as React from 'react'

const OVLogo = () => {
    const circleRef = useRef<HTMLDivElement>(null)
    const triangleRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex flex-col items-center justify-center p-12 px-16 pr-[4.2rem] ">
        <div className="relative flex flex-row items-center justify-center">
          <div 
            ref={circleRef}
            className="w-[6.25rem] h-[6.25rem] rounded-full bg-black "
          ></div>

          <div
            ref={triangleRef}
            className="w-0 h-0 border-l-[55px] border-r-[55px] border-t-[96px] border-l-transparent border-r-transparent border-t-black "
          ></div>
        </div>
      </div>
    )
  }
  
export default OVLogo