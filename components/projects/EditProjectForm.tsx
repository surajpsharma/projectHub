"use client";

import React, { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { SafeImage } from '../ui/safe-image';
import { updateProject } from '@/lib/action';
import { formSchema } from '@/lib/validation';
import { z } from 'zod';
import {
  Code, Tag, FileText, Link as LinkIcon, Sparkles, ArrowLeft,
  Github, Globe, BookOpen, Image as ImageIcon, Send, Plus, X, Laptop
} from 'lucide-react';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with browser-only APIs in @uiw/react-md-editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });


const POPULAR_TECH = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB",
  "Python", "Rust", "Go", "Firebase", "PostgreSQL", "Java", "C++"
];

const CATEGORIES = [
  "Web Development", "Mobile App", "AI/ML", "Blockchain", "IoT",
  "Game Development", "Data Science", "DevOps", "UI/UX", "Open Source"
];

interface EditProjectFormProps {
  project: {
    _id: string;
    title: string;
    description: string;
    category: string;
    image?: string;
    coverImage?: string;
    details: string;
    githubUrl: string;
    liveUrl: string;
    documentationUrl: string;
    technologies: string[];
    screenshots: string[];
    status: "Draft" | "Published";
  };
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [category, setCategory] = useState(project.category);
  const [details, setDetails] = useState(project.details);
  
  // Tech Selection
  const [selectedTech, setSelectedTech] = useState<string[]>(project.technologies);
  const [customTech, setCustomTech] = useState('');

  // Links
  const [githubUrl, setGithubUrl] = useState(project.githubUrl);
  const [liveUrl, setLiveUrl] = useState(project.liveUrl);
  const [documentationUrl, setDocumentationUrl] = useState(project.documentationUrl);

  // Images
  const [coverImage, setCoverImage] = useState(project.coverImage || project.image || '');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>(project.screenshots || []);
  
  // Status
  const [status, setStatus] = useState<"Draft" | "Published">(project.status);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Helper for direct image preview validation
  const [imageValidating, setImageValidating] = useState(false);
  const [imageValid, setImageValid] = useState(true);

  const validateImageUrl = (url: string, callback: (valid: boolean) => void) => {
    if (!url) {
      callback(false);
      return;
    }
    setImageValidating(true);
    const img = new Image();
    img.onload = () => {
      callback(true);
      setImageValidating(false);
    };
    img.onerror = () => {
      callback(false);
      setImageValidating(false);
    };
    img.src = url;
  };

  const handleCoverImageChange = (url: string) => {
    setCoverImage(url);
    validateImageUrl(url, (valid) => {
      setImageValid(valid);
    });
  };

  const addScreenshot = () => {
    if (!screenshotInput) return;
    validateImageUrl(screenshotInput, (valid) => {
      if (valid) {
        setScreenshots([...screenshots, screenshotInput]);
        setScreenshotInput('');
      } else {
        toast({
          title: "Invalid screenshot URL",
          description: "Please enter a direct, public image link.",
          variant: "destructive",
        });
      }
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const toggleTech = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const addCustomTech = () => {
    if (!customTech.trim()) return;
    const clean = customTech.trim();
    if (!selectedTech.includes(clean)) {
      setSelectedTech([...selectedTech, clean]);
    }
    setCustomTech('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTech = [...selectedTech].join(",");
    const finalData = {
      title,
      description,
      category,
      link: coverImage,
      githubUrl,
      liveUrl,
      documentationUrl,
      technologies: allTech,
      screenshots,
      status,
      details,
    };

    // Comprehensive client-side Zod validation
    try {
      setErrors({});
      await formSchema.parseAsync(finalData);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: err.errors[0]?.message || "Please fix form errors.",
          variant: "destructive",
        });
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("link", coverImage);
      formData.set("githubUrl", githubUrl);
      formData.set("liveUrl", liveUrl);
      formData.set("documentationUrl", documentationUrl);
      formData.set("technologies", allTech);
      formData.set("screenshots", JSON.stringify(screenshots));
      formData.set("status", status);

      const res = await updateProject(project._id, null, formData, details);

      if (res.status === 'Success') {
        toast({
          title: "Project Updated 🎉",
          description: "Your project details have been successfully saved.",
        });
        router.push(`/projects/${res.slug}`);
      } else {
        toast({
          title: "Update Failed",
          description: res.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Edit Project
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your project specifications, cover visual, and codebase URLs.
          </p>
        </div>
        <Link href={`/projects/${project._id}`}>
          <Button variant="outline" className="text-xs font-bold">
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Project Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Code Auditor"
                className="bg-transparent border-gray-200 dark:border-gray-800 py-6"
                required
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Short Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A clear, compelling summary under 500 characters..."
                className="min-h-[100px] resize-none bg-transparent border-gray-200 dark:border-gray-800"
                required
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2" data-color-mode="light">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Detailed Description (Markdown) *
              </label>
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <MDEditor
                  value={details}
                  onChange={(val) => setDetails(val || '')}
                  height={350}
                  preview="edit"
                />
              </div>
              {errors.details && <p className="text-xs text-red-500">{errors.details}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Categories & Tech Stack */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              <span>Category & Stack</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-colors ${
                      category === cat
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            <hr className="border-gray-100 dark:border-gray-850" />

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Technologies *
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TECH.map((tech) => {
                  const selected = selectedTech.includes(tech);
                  return (
                    <Badge
                      key={tech}
                      variant="secondary"
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1 cursor-pointer select-none font-bold text-xs border ${
                        selected
                          ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {tech}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-sm pt-2">
                <Input
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  placeholder="e.g. Docker, Redis, PyTorch"
                  className="h-9 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTech())}
                />
                <Button type="button" size="sm" onClick={addCustomTech} className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {errors.technologies && <p className="text-xs text-red-500">{errors.technologies}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-500" />
              <span>Links & Repository</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Github className="w-4 h-4 text-gray-500" />
                <span>GitHub Repository URL *</span>
              </label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo-name"
                className="bg-transparent border-gray-200 dark:border-gray-800 py-6"
                required
              />
              {errors.githubUrl && <p className="text-xs text-red-500">{errors.githubUrl}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Live Demo URL (Optional)</span>
              </label>
              <Input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://my-demo-link.vercel.app"
                className="bg-transparent border-gray-200 dark:border-gray-800 py-6"
              />
              {errors.liveUrl && <p className="text-xs text-red-500">{errors.liveUrl}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span>Documentation URL (Optional)</span>
              </label>
              <Input
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                placeholder="https://my-docs-link.gitbook.io"
                className="bg-transparent border-gray-200 dark:border-gray-800 py-6"
              />
              {errors.documentationUrl && <p className="text-xs text-red-500">{errors.documentationUrl}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Visuals */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <span>Visual Assets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Project Cover/Thumbnail URL *
              </label>
              <Input
                value={coverImage}
                onChange={(e) => handleCoverImageChange(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="bg-transparent border-gray-200 dark:border-gray-800 py-6"
                required
              />
              {imageValidating && <p className="text-xs text-gray-400">Verifying cover image URL...</p>}
              {coverImage && (
                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-gray-250 dark:border-gray-800 bg-gray-50 mt-3 mx-auto">
                  <SafeImage
                    src={coverImage}
                    alt="Thumbnail cover preview"
                    width={380}
                    height={215}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://placehold.co/380x215/e2e8f0/64748b?text=Preview"
                  />
                </div>
              )}
              {errors.link && <p className="text-xs text-red-500">{errors.link}</p>}
            </div>

            <hr className="border-gray-100 dark:border-gray-850" />

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Screenshots (Optional, up to 3)
              </label>
              <div className="flex gap-2">
                <Input
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  placeholder="https://my-screenshot-url.jpg"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                <Button type="button" onClick={addScreenshot} className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                  Add
                </Button>
              </div>

              {screenshots.length > 0 && (
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {screenshots.map((shot, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-gray-250 dark:border-gray-800 bg-gray-50 group">
                      <SafeImage
                        src={shot}
                        alt="Screenshot"
                        width={200}
                        height={115}
                        className="w-full h-full object-cover"
                        fallbackSrc="https://placehold.co/200x115/e2e8f0/64748b?text=Preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full opacity-95 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Visibility Status</span>
                <span className="text-xs text-gray-405 block">Choose whether to publish publicly or keep as draft.</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("Published")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                    status === "Published"
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400"
                  }`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("Draft")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                    status === "Draft"
                      ? "bg-gray-500 border-gray-500 text-white"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-655 dark:text-gray-400"
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/projects/${project._id}`}>
            <Button type="button" variant="outline" className="px-6 py-6 rounded-lg font-bold">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-lg shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isPending ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
