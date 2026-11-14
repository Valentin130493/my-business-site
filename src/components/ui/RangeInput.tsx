"use client";

import { useEffect, useEffectEvent, useRef, type ChangeEvent, type CSSProperties } from "react";

import { attachTouchSlide } from "@/lib/touchSlide";

type RangeInputProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  className?: string;
  style?: CSSProperties;
};

export function RangeInput({ onValueChange, ...inputProps }: RangeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSlide = useEffectEvent(onValueChange);

  useEffect(() => {
    if (!inputRef.current) return;
    return attachTouchSlide(inputRef.current, handleSlide);
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(Number(event.target.value));
  }

  return <input ref={inputRef} type="range" onChange={handleChange} {...inputProps} />;
}
