import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MousePointer2, Plus } from 'lucide-react';

type AttachmentPointAnimationProps = {
  className?: string;
};

export function AttachmentPointAnimation({ className }: AttachmentPointAnimationProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current || !cursorRef.current || !rippleRef.current) return;

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    timeline.set(cursorRef.current, { x: 24, y: 24, opacity: 0, scale: 1, rotation: -10 });
    timeline.set(rippleRef.current, { scale: 0.8, opacity: 0 });
    timeline.set(buttonRef.current, {
      backgroundColor: '#ffffff',
      color: '#000000',
      borderColor: '#e5e7eb',
    });

    timeline
      .to(cursorRef.current, {
        x: 8,
        y: 10,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })
      .to({}, { duration: 0.15 })
      .to(cursorRef.current, { scale: 0.85, duration: 0.1 })
      .to(
        rippleRef.current,
        {
          scale: 2.2,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        '<'
      )
      .to(
        buttonRef.current,
        {
          backgroundColor: '#d1fae5',
          color: '#064e3b',
          borderColor: '#e5e7eb',
          duration: 0.15,
        },
        '<'
      )
      .to(cursorRef.current, { scale: 1, duration: 0.15 })
      .to({}, { duration: 1.2 })
      .to(cursorRef.current, {
        x: 20,
        y: 26,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      })
      .to(
        buttonRef.current,
        {
          backgroundColor: '#ffffff',
          color: '#000000',
          borderColor: '#e5e7eb',
          duration: 0.3,
        },
        '-=0.3'
      );

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div className={`ov:relative ov:w-[80px] ov:h-[80px] ov:flex ov:items-center ov:justify-center ${className ?? ''}`}>
      <div
        ref={rippleRef}
        className="ov:absolute ov:inset-0 ov:rounded-full ov:border-2 ov:border-emerald-400 ov:bg-emerald-100/50 ov:pointer-events-none"
        style={{ transformOrigin: 'center' }}
      />
      <div
        ref={buttonRef}
        className="ov:relative ov:z-10 ov:w-full ov:h-full ov:bg-white ov:text-black ov:rounded-full ov:border ov:border-gray-200 ov:flex ov:items-center ov:justify-center ov:[box-shadow:inset_0_1.5px_6px_0_rgba(154,154,154,0.35),inset_0_1px_3px_0_rgba(243,244,246,0.12)]"
      >
        <Plus className="ov:w-10 ov:h-10" strokeWidth={2.5} />
      </div>
      <div
        ref={cursorRef}
        className="ov:absolute ov:z-20 ov:top-1/2 ov:left-1/2 ov:pointer-events-none ov:text-gray-800"
        style={{ filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.15))' }}
      >
        <MousePointer2 size={28} fill="white" strokeWidth={2} className="ov:-ml-1 ov:-mt-1" />
      </div>
    </div>
  );
}
