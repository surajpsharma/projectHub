"use client"
import React from 'react'
import Form from 'next/form';
import { Search, Sparkles } from 'lucide-react';
import SearchFormReset from './SearchFormReset';

const SearchForm = ({ query }: { query?: string }) => {
  const handleTagClick = (tag: string) => {
    const input = document.querySelector('input[name="query"]') as HTMLInputElement;
    if (input) {
      input.value = tag;
      input.form?.requestSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <Form
        action="/"
        scroll={false}
        className='relative flex items-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20'
      >
        {/* Search Icon */}
        <div className='absolute left-4 text-gray-400 dark:text-gray-500'>
          <Search className='w-5 h-5' />
        </div>

        {/* Input Field */}
        <input
          type="text"
          name='query'
          defaultValue={query || ""}
          className='flex-1 pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg font-medium outline-none'
          placeholder='Search for innovative projects...'
          autoComplete="off"
        />

        {/* Action Buttons */}
        <div className='flex items-center gap-2 pr-2'>
          {query && (
            <SearchFormReset />
          )}

          <button
            type='submit'
            className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95'
          >
            <Sparkles className='w-4 h-4' />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </Form>

      {/* Search Suggestions */}
      <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none group-focus-within:pointer-events-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {['AI', 'Web Development', 'Mobile App', 'Design', 'Blockchain'].map((tag) => (
              <button
                key={tag}
                type="button"
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchForm