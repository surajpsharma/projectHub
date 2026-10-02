import { auth, signOut } from '@/auth'
import LoginOptions from './LoginOptions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Plus, LogOut, User, Search, Menu, Code2, Globe, Compass, Users2, Library, LayoutDashboard, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import SearchForm from './SearchForm'

const NavBar = async () => {
  const session = await auth();

  return (
    <header className='sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-colors duration-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <nav className='flex h-16 items-center justify-between gap-4'>
          {/* Logo */}
          <Link href="/" className='flex items-center space-x-2.5 hover:opacity-90 transition-opacity shrink-0'>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <span className='text-lg font-bold tracking-tight text-gray-900 dark:text-white'>
              ProjectHub
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
              Explore
            </Link>
            <Link href="/projects" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
              Projects
            </Link>
            <Link href="/creators" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
              Creators
            </Link>
            <Link href="/technologies" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
              Technologies
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm relative">
            <form action="/projects" method="GET" className="w-full relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="query"
                placeholder="Search projects, stack, creators..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white dark:bg-gray-900 dark:hover:bg-gray-800/70 dark:focus:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 text-gray-900 dark:text-gray-100"
              />
            </form>
          </div>

          {/* Actions & Profile */}
          <div className='flex items-center space-x-3 shrink-0'>
            {/* Search Trigger for tablet/mobile */}
            <Link href="/projects" className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            <ThemeToggle />

            {session && session?.user ? (
              <>
                {/* Create Project Button */}
                <Link href="/projects/create">
                  <Button
                    size="sm"
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-150 flex items-center'
                  >
                    <Plus className='w-4 h-4 mr-1.5' />
                    <span className='hidden sm:inline'>Share Project</span>
                  </Button>
                </Link>

                {/* Profile Settings Dropdown alternative/direct */}
                <div className="relative group">
                  <button
                    className='flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors duration-150'
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={28}
                        height={28}
                        className='rounded-full border border-gray-200 dark:border-gray-800'
                      />
                    ) : (
                      <div className='w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center'>
                        <User className='w-3.5 h-3.5 text-white' />
                      </div>
                    )}
                    <span className='hidden sm:block text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[90px] truncate'>
                      {session.user?.name}
                    </span>
                  </button>

                  {/* Dropdown Box */}
                  <div className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-1 hidden group-hover:block hover:block z-50">
                    <Link
                      href={`/creators/${session?.user?.name?.toLowerCase().replace(/\s+/g, "") || session?.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="border-gray-200 dark:border-gray-800 my-1" />
                    <form
                      action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <button
                        type='submit'
                        className='flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors'
                      >
                        <LogOut className='w-4 h-4' />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <LoginOptions />
            )}

            {/* Mobile Hamburger menu */}
            <div className="md:hidden relative group">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md border border-gray-200 dark:border-gray-800"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-1 hidden group-hover:block hover:block z-50">
                <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Compass className="w-4 h-4" />
                  Explore
                </Link>
                <Link href="/projects" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Globe className="w-4 h-4" />
                  Projects
                </Link>
                <Link href="/creators" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Users2 className="w-4 h-4" />
                  Creators
                </Link>
                <Link href="/technologies" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Library className="w-4 h-4" />
                  Technologies
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default NavBar