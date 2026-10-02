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
import { createProject } from '@/lib/action';
import { formSchema } from '@/lib/validation';
import { z } from 'zod';
import {
  Code, Eye, Tag, FileText, Link as LinkIcon, Sparkles, ArrowRight, ArrowLeft,
  Github, Globe, BookOpen, Image as ImageIcon, Send, Plus, X, Laptop
} from 'lucide-react';

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

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  
  // Tech Selection
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState('');

  // Links
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');

  // Images
  const [coverImage, setCoverImage] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  
  // Status
  const [status, setStatus] = useState<"Draft" | "Published">("Published");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Helper for direct image preview validation
  const [imageValidating, setImageValidating] = useState(false);
  const [imageValid, setImageValid] = useState(false);

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

  // Step Validation
  const validateStep = async (currentStep: number) => {
    setErrors({});
    
    // Aggregate technologies
    const allTech = [...selectedTech];
    const techString = allTech.join(',');

    const dataToValidate = {
      title,
      description,
      category,
      link: coverImage,
      githubUrl,
      liveUrl,
      documentationUrl,
      technologies: techString,
      screenshots,
      status,
      details: details || "details_placeholder_to_bypass_initial_steps" // bypass details validation in early steps
    };

    try {
      if (currentStep === 1) {
        // Validate basics
        formSchema.pick({ title: true, description: true }).parse({ title, description });
      } else if (currentStep === 2) {
        // Validate category & tech
        formSchema.pick({ category: true, technologies: true }).parse({ category, technologies: techString });
      } else if (currentStep === 3) {
        // Validate links
        formSchema.pick({ githubUrl: true, liveUrl: true, documentationUrl: true }).parse({ githubUrl, liveUrl, documentationUrl });
      } else if (currentStep === 4) {
        // Validate cover image URL
        formSchema.pick({ link: true }).parse({ link: coverImage });
      }
      return true;
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
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

    // Final comprehensive Zod validation
    try {
      await formSchema.parseAsync(finalData);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0]?.message || "Please check your inputs.",
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

      const res = await createProject(null, formData, details);

      if (res.status === 'Success') {
        toast({
          title: "Congratulations! 🎉",
          description: "Your project has been successfully published.",
        });
        router.push(`/projects/${res.slug}`);
      } else {
        toast({
          title: "Publish Failed",
          description: res.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between max-w-md mx-auto select-none">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                s <= step
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-650 border border-gray-200 dark:border-gray-800"
              }`}
            >
              {s}
            </div>
            {s < 5 && (
              <div
                className={`flex-1 h-0.5 transition-all duration-200 ${
                  s < step ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {step === 1 && "Basic Info"}
          {step === 2 && "Technology & Stack"}
          {step === 3 && "Links & Repository"}
          {step === 4 && "Images & Thumbnails"}
          {step === 5 && "Review & Publish"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-405 max-w-sm mx-auto">
          {step === 1 && "Provide a title and a compelling description of your project."}
          {step === 2 && "Categorize and tag the technologies you used to build it."}
          {step === 3 && "Share the codebase repository, demo, and documentations."}
          {step === 4 && "Add thumbnail cover images and project screenshots."}
          {step === 5 && "Review your submission before going live."}
        </p>
      </div>

      <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
        {/* STEP 1: BASIC INFORMATION */}
        {step === 1 && (
          <Card className="border-gray-200/60 dark:border-gray-850">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Project Basics</span>
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
                    height={300}
                    preview="edit"
                    textareaProps={{
                      placeholder: "Write details, installation instructions, features list, how it works, and screenshots using Markdown..."
                    }}
                  />
                </div>
                {errors.details && <p className="text-xs text-red-500">{errors.details}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: TECHNOLOGY */}
        {step === 2 && (
          <Card className="border-gray-200/60 dark:border-gray-850">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                <span>Category & Stack</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category */}
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

              {/* Technologies */}
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

                {/* Custom Tech */}
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
        )}

        {/* STEP 3: LINKS */}
        {step === 3 && (
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
        )}

        {/* STEP 4: IMAGES */}
        {step === 4 && (
          <Card className="border-gray-200/60 dark:border-gray-850">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <span>Images & Cover</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Image URL */}
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
                {coverImage && !imageValidating && (
                  <p className={`text-xs ${imageValid ? "text-green-500" : "text-amber-500"}`}>
                    {imageValid ? "✓ Direct image link verified" : "⚠ Could not verify image load (direct hotlinking block might occur)"}
                  </p>
                )}
                {errors.link && <p className="text-xs text-red-500">{errors.link}</p>}
                
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
              </div>

              <hr className="border-gray-100 dark:border-gray-850" />

              {/* Screenshots list input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Add Screenshot URLs (Optional, up to 3)
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
                          className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-all"
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
        )}

        {/* STEP 5: REVIEW & PUBLISH */}
        {step === 5 && (
          <div className="space-y-6">
            <Card className="border-gray-200/60 dark:border-gray-850">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span>Review Submission</span>
                </CardTitle>
                <CardDescription>
                  Review the summary of your project details before publishing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Category</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{category}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Title</span>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">{title}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Short Description</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedTech.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[9px] font-bold">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">GitHub Repository</span>
                      <p className="text-xs font-mono text-gray-500 truncate">{githubUrl}</p>
                    </div>
                    {liveUrl && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Live Demo</span>
                        <p className="text-xs font-mono text-gray-500 truncate">{liveUrl}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Thumbnail Preview</span>
                      <div className="relative aspect-video max-w-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 mt-1">
                        <SafeImage
                          src={coverImage}
                          alt="Thumbnail Preview"
                          width={200}
                          height={115}
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x115/e2e8f0/64748b?text=Cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-850" />

                {/* Status Selection: Publish or Draft */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visibility Status:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("Published")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        status === "Published"
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Draft")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        status === "Draft"
                          ? "bg-gray-500 border-gray-500 text-white"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{isPending ? "Submitting..." : status === "Published" ? "Publish Your Project" : "Save as Draft"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-1.5 px-5 py-5 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 5 && (
            <Button type="button" onClick={nextStep} className="bg-gray-900 hover:bg-gray-850 dark:bg-gray-100 dark:hover:bg-gray-50 text-white dark:text-gray-900 flex items-center gap-1.5 px-5 py-5 rounded-lg font-bold">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
