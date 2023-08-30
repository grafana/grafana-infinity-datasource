import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="py-8 px-6">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 pb-8 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 border-2 border-[rgba(255,255,255,0.1)]">
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/4 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          aria-hidden="true"
        >
          <circle cx={512} cy={512} r={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left xs:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Enrich Grafana with data from any API</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">Ranging from Pokemon API to Azure billing APIs</p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <Link
              href="/docs/installation"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            <Link href="/blog" className="text-sm font-semibold leading-6 text-white">
              Show examples <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="relative mt-16 h-80 lg:mt-16 hover:mt-8 transition-[margin] duration-700 hidden lg:block">
          <Image
            className="absolute left-0 top-0 w-[57rem] max-w-none rounded-lg bg-white/5 ring-1 ring-white/10"
            src="https://user-images.githubusercontent.com/153843/189875668-3ac061a9-c548-4bfe-abcc-6d0d7e6bdb55.png"
            alt="App screenshot"
            width={1824}
            height={1080}
          />
        </div>
      </div>
    </div>
  );
}
