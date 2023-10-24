import {ReactNode} from 'react'
import Head from 'next/head'
import Nav from './Nav'
import { NEXT_PUBLIC_CHAIN_EXPLORER, NEXT_PUBLIC_CHAIN_NAME, NEXT_PUBLIC_SITE_TITLE } from 'constants/constants'

export default function Layout({children}: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
      <Head>
        <title>{NEXT_PUBLIC_SITE_TITLE}</title>
        <meta name="description" content="Generated by create next app"/>
        <link rel="icon" href="/favicon.png"/>
      </Head>

      <Nav/>
      <main className="flex flex-col items-center justify-center w-full flex-1 p-2 md:px-20 text-center">
        {children}
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          target="_blank" rel="noreferrer" href={NEXT_PUBLIC_CHAIN_EXPLORER || ""}
          className="pl-1 link link-primary link-hover"
        >
          {NEXT_PUBLIC_CHAIN_NAME} Explorer
        </a>
        <span className="pl-1"> | </span>
        <a
          className="pl-1 link link-primary link-hover"
          href="https://docs.coreum.dev/"
        >
          Coreum Docs
        </a>
        <span className="pl-1"> | </span>
        <a
          className="pl-1 link link-primary link-hover"
          href="https://github.com/cosmos/cosmjs"
        >
          CosmJS Docs
        </a>
        <span className="pl-1"> | </span>
        <a
          className="pl-1 link link-primary link-hover"
          href="https://keplr.app/"
        >
          Keplr App
        </a>
      </footer>
    </div>
  )
}
