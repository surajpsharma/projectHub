"use client";
import React from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import Link from "next/link";
import { ProjectTypeCard } from "./ProjectCard";
import { SafeImage } from "./ui/safe-image";

export function ThreeDCardDemo({ post }: { post: ProjectTypeCard }) {
  const { _createdAt, views, author, title, category, _id, description, image } = post;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <CardContainer className="inter-var w-full">
      <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-gray-800 dark:border-white/[0.1] border-gray-200 w-full h-[28rem] rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300">

        {/* Header with Category and Views */}
        <div className="flex justify-between items-start mb-4">
          <CardItem
            translateZ="30"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full"
          >
            {category}
          </CardItem>
          <CardItem
            translateZ="30"
            className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {views || 0}
          </CardItem>
        </div>

        {/* Title */}
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2"
        >
          {title}
        </CardItem>

        {/* Description */}
        <CardItem
          as="p"
          translateZ="60"
          className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3"
        >
          {description}
        </CardItem>

        {/* Project Image */}
        <CardItem translateZ="100" className="w-full mb-4">
          <Link href={`/project/${_id}`} className="block">
            <div className="relative overflow-hidden rounded-lg">
              <SafeImage
                src={image}
                height="200"
                width="400"
                className="h-40 w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                alt={title || 'Project image'}
                fallbackSrc="https://placehold.co/400x200/e2e8f0/64748b?text=Project"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        </CardItem>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto">
          <CardItem
            translateZ={20}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {formatDate(_createdAt)}
            <Link href={`/user/${post.author?._id}`} className='text-16-medium text-blue-500 cursor-pointer'>
              <div>@{post.author?.username}</div>
            </Link>


          </CardItem>

          <CardItem
            translateZ={20}
            as={Link}
            href={`/project/${_id}`}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg"
          >
            View Details

          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
