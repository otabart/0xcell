import * as React from "react"
import { Button as UIButton } from "../../ui/Button"

export interface IButtonProps {
  id: string
  label: string
  className?: string
  onClick: () => void
}

export const Button = (props: IButtonProps) => {
  return (
    <UIButton onClick={props.onClick} size="lg" className={props.className}>
      {props.label}
    </UIButton>
  )
}
