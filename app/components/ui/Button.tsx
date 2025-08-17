"use client"

import React from "react"

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "ghost" | "tab"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
  active?: boolean
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  active = false,
}: ButtonProps) => {
  // Base styles
  const baseStyles = `
    font-mono uppercase tracking-wider cursor-pointer
    transition-all duration-200 ease-in-out
    border rounded-none text-center
    disabled:cursor-not-allowed disabled:opacity-50
  `

  // Variant styles
  const variantStyles = {
    primary: `
      bg-transparent text-white border-white/20
      hover:bg-white/10 hover:border-white/40
      active:bg-white/5
      disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700
    `,
    secondary: `
      bg-white/10 text-white border-white/30
      hover:bg-white/20 hover:border-white/50
      active:bg-white/15
      disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700
    `,
    ghost: `
      bg-transparent text-gray-400 border-transparent
      hover:text-white hover:bg-white/5
      active:bg-white/10
      disabled:text-gray-600
    `,
    tab: `
      bg-transparent border-b-2 rounded-none
      ${active ? "text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300"}
    `,
  }

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }

  // Width styles
  const widthStyles = fullWidth ? "w-full" : ""

  // Combine all styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim()

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={combinedStyles}>
      {children}
    </button>
  )
}
