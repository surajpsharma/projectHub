"use client"
import { X } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const SearchFormReset = () => {
  const reset = () => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) form.reset();
  }
  return (
    <Link
      href="/"
      className='flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
      onClick={reset}
    >
      <X className='w-4 h-4' />
    </Link>
  )
}

export default SearchFormReset