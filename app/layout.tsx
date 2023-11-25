import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Provider from './components/Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Multi-Lingual Chatbot',
  description: 'A Chatbot for Practicing Conversational Language Learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-screen h-screen overflow-x-hidden bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark`}>    
        <Provider>
         {children}
        </Provider>
      </body>
    </html>
  )
}
