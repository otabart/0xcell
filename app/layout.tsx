import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "0xCell - On-Chain Conway's Game of Life",
  description:
    "0xCell is an on-chain implementation of Conway’s Game of Life, built on three core technologies: Circle CCTP Messaging, Proof of Work (PoW), and Chainlink VRF.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "lch(2.467 0 272)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
