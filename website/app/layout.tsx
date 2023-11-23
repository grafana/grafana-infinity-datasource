'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommandMenu } from '@/components/command-menu';
import MobilNav from '@/components/nav-mobile';
import { cn } from '@/lib/utils';
import { site_config } from '@/lib/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-none  backdrop-blur bg-gray-900 text-gray-100 border-gray-700">
            <div className="md:container flex gap-2 h-14 sm:items-center">
              <div className="mr-4 hidden md:flex">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <Link href="/" className="flex items-center space-x-4 ml-6">
                    <Image src={site_config.logo.url} alt={site_config.logo.alt} width={30} height={30} />
                    <span className="hidden sm:inline-block">{site_config.title}</span>
                  </Link>
                  {site_config.mainNav.map((item) => (
                    <Link href={item.href} key={JSON.stringify(item)} target={item.external ? '_blank' : ''} className={'transition-colors text-gray-100 hover:text-gray-200 flex'}>
                      {item.title}
                      {item.external ? <Image src="https://www.svgrepo.com/show/510970/external-link.svg" width={12} height={12} alt={`opening in external tab`} className="ml-1" /> : null}
                    </Link>
                  ))}
                </nav>
              </div>
              <MobilNav />
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  <CommandMenu />
                </div>
                <nav className="flex items-center">
                  <Link href={'https://github.com/grafana/grafana-infinity-datasource'} target="_blank" className="ml-2">
                    <Image src="https://www.svgrepo.com/show/439171/github.svg" width={24} height={24} alt="" className="grayscale hover:grayscale-0" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                  <Link href={'https://twitter.com/grafanaInfinity'} target="_blank" className="ml-2">
                    <Image src="https://www.svgrepo.com/show/448252/twitter.svg" width={24} height={24} alt="" className="grayscale hover:grayscale-0" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href={'https://www.youtube.com/playlist?list=PL4vVKeEREln5ub1qrSMrwAabU0FiSNtmC'} target="_blank" className="ml-2">
                    <Image src="https://www.svgrepo.com/show/448261/youtube.svg" width={24} height={24} alt="" className="grayscale hover:grayscale-0" />
                    <span className="sr-only">Youtube</span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div>
              {pathname === '/' ? (
                <div className="py-10 bg-gray-900">{children}</div>
              ) : (
                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                  <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                    <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
                      <DocsSidebarNav items={site_config.sidebarNav} />
                    </ScrollArea>
                  </aside>
                  <main className="relative py-6 lg:gap-10 lg:py-8">
                    <div className="mx-auto w-full min-w-0">{children}</div>
                  </main>
                </div>
              )}
            </div>
          </main>
          <footer className="py-6 border-t-1 border-gray-700 text-center bg-gray-800">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground w-full">Copyright © 2023 Grafana Labs</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

const DocsSidebarNav = ({ items }: { items: SidebarNavItem[] }) => {
  const pathname = usePathname();
  return items.length ? (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className={cn('pb-4')}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{item.title}</h4>
          {item?.items?.length && <DocsSidebarNavItems items={item.items} pathname={pathname} />}
        </div>
      ))}
    </div>
  ) : null;
};

const DocsSidebarNavItems = ({ items, pathname }: { items: SidebarNavItem[]; pathname: string | null }) => {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              'group flex w-full items-center rounded-md border border-transparent px-2 py-1  hover:bg-slate-200',
              item.disabled && 'cursor-not-allowed opacity-60',
              pathname === item.href ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
            target={item.external ? '_blank' : ''}
            rel={item.external ? 'noreferrer' : ''}
          >
            {item.title}
            {item.label && <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">{item.label}</span>}
          </Link>
        ) : (
          <span key={index} className={cn('flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline', item.disabled && 'cursor-not-allowed opacity-60')}>
            {item.title}
            {item.label && <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">{item.label}</span>}
          </span>
        )
      )}
    </div>
  ) : null;
};

type NavItem = { title: string; href?: string; disabled?: boolean; external?: boolean; label?: string };
type NavItemWithChildren = { items: NavItemWithChildren[] } & NavItem;
type SidebarNavItem = {} & NavItemWithChildren;
