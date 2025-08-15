'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectKitButton } from 'connectkit'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/contracts', label: 'Contracts' },
  ]

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Emerge
            </Link>
            
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <ConnectKitButton />
        </div>
      </div>
    </nav>
  )
}
