import { auth, signOut } from '@/auth'
import LoginOptions from './LoginOptions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Plus, LogOut, User } from 'lucide-react'

const NavBar = async () => {
  const session = await auth();
  return (
    <header className='sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <nav className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href="/" className='flex items-center space-x-3 hover:opacity-80 transition-opacity'>
            <Image
              src="/logo.png"
              alt="ProjectHub"
              width={32}
              height={32}
              priority
              className='rounded-lg'
            />
            <span className='text-xl font-bold text-gray-900 dark:text-white'>
              ProjectHub
            </span>
          </Link>

          {/* Right Section */}
          <div className='flex items-center space-x-4'>
            {session && session?.user ? (
              <>
                {/* Create Button */}
                <Link href="/project/create">
                  <Button
                    size="sm"
                    className='bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    <span className='hidden sm:inline'>Create</span>
                  </Button>
                </Link>

                {/* User Profile */}
                <Link
                  href={`/user/${session?.id}`}
                  className='flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200'
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className='rounded-full border-2 border-gray-200 dark:border-gray-700'
                    />
                  ) : (
                    <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                      <User className='w-4 h-4 text-white' />
                    </div>
                  )}
                  <span className='hidden sm:block text-sm font-medium text-gray-900 dark:text-white'>
                    {session.user?.name}
                  </span>
                </Link>

                {/* Logout Button */}
                <form
                  action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button
                    type='submit'
                    variant="ghost"
                    size="sm"
                    className='text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200'
                  >
                    <LogOut className='w-4 h-4' />
                  </Button>
                </form>
              </>
            ) : (
              <LoginOptions />
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default NavBar