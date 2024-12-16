"use client";
import { Inter } from 'next/font/google'
import './globals.css'
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import { TREASURY } from './utils/constants';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <AbstraxionProvider
          config={{
            contracts: ["xion18mamtc4s9wsd2qy24xc9qmyznkw5js6a6tpdnhz3gqud390tjfsszpwj89"],
          }}
        > */}
        <AbstraxionProvider
          config={{
            ...TREASURY
          }}
        >
          {children}
        </AbstraxionProvider>
      </body>
    </html>
  )
}
