import { ReactNode } from 'react'
import { useWrappedClientContext } from 'contexts/client'
import Loader from './Loader'
import Image from 'next/image';

function WalletLoader({
  children,
  loading = false,
}: {
  children: ReactNode
  loading?: boolean
}) {
  const {
    walletAddress,
    loading: clientLoading,
    error,
    connectWallet,
  } = useWrappedClientContext()

  if (loading || clientLoading) {
    return (
      <div className="justify-center">
        <Loader />
      </div>
    )
  }

  if (walletAddress === '') {
    return (
      <div className="max-w-full text-center flex flex-col items-center">
        <Image
          src="/bg.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          style={{ opacity: '0.1', filter: 'grayscale(100%)' }}
        />
        <div className="z-10 p-16 backdrop-blur-sm rounded-xl flex flex-col items-center" style={{ boxShadow: '0px 0px 50px 0px #707070' }}>
          <h1 className="mb-10 text-8xl font-bold">
            Cored<span className="bg-primary px-3 ml-2 text-secondary rounded-xl">In</span>
          </h1>
          <p className="text-md max-w-md">
            PoC Social app for professionals to leverage control over their sensitive data through self-sovereign identity (SSI)
          </p>
          <div className="flex flex-wrap rounded-xl items-center justify-around md:max-w-4xl mt-10 sm:w-full">
            <button
              className="p-6 text-left border border-primary text-primary hover:border-primary hover:bg-primary max-w-lg rounded-xl hover:text-secondary"
              onClick={connectWallet}
            >
              <h3 className="text-2xl font-bold">Connect your wallet &rarr;</h3>
              <p className="mt-4 text-xl">
                Connect your Keplr wallet to start using CoredIn.
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <code>{JSON.stringify(error)}</code>
  }

  return <>{children}</>
}

export default WalletLoader
