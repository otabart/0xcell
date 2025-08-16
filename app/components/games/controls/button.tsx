import * as React from "react"

export interface IButtonProps {
  id: string
  label: string
  className?: string
  onClick: () => void
}

export const Button = (props: IButtonProps) => {
  return (
    <button
      id={props.id}
      onClick={props.onClick}
      className={`text-sm font-light p-3 min-w-[4.5rem] bg-transparent text-white border rounded-none cursor-pointer transition-all duration-200 ease-in-out uppercase tracking-wider hover:bg-white/10 hover:border-white/40 hover:text-white active:bg-white/5 ${props.className}`}
    >
      {props.label}
    </button>
  )
}
