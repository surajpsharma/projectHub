import React from 'react'

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Profile Card Skeleton */}
          <div className="lg:w-1/3">
            <div className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800 rounded-lg">
              {/* Header gradient skeleton */}
              <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 animate-pulse">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                </div>
              </div>

              {/* Profile info skeleton */}
              <div className="pt-20 pb-8 px-8 text-center space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto w-3/4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto w-2/3"></div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section Skeleton */}
          <div className="lg:w-2/3 flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-64"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-48"></div>
                </div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-24"></div>
              </div>

              {/* Projects grid skeleton */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
                      </div>
                      <div className="h-40 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProjectCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
        <div className="h-40 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}