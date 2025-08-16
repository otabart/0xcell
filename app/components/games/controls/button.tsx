import * as React from "react"

export interface IButtonProps {
  id: string
  label: string
  onClick: () => void
}

export const Button = (props: IButtonProps) => {
  return (
    <button
      id={props.id}
      onClick={props.onClick}
      className="text-sm font-light px-4 py-2 min-w-[4.5rem] bg-transparent text-white/80 border border-white/20 rounded-none cursor-pointer transition-all duration-200 ease-in-out uppercase tracking-wider hover:bg-white/10 hover:border-white/40 hover:text-white active:bg-white/5"
    >
      {props.label}
    </button>
  )
}
