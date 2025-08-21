"use client"
import React, { useActionState, useState } from 'react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import MDEditor from '@uiw/react-md-editor'
import { Button } from './ui/button'
import { formSchema } from '@/lib/validation'
import { createProject } from '@/lib/action'
import { useRouter } from 'next/navigation'
import { z } from "zod";
import { useToast } from '@/hooks/use-toast'
import { Send, Upload, Eye, Code, Tag, FileText, Link, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { SafeImage } from './ui/safe-image'
const ProjectForm = () => {

    const { toast } = useToast();
    const [details, setDetails] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const router = useRouter();

    // Popular categories for suggestions
    const popularCategories = [
        "Web Development", "Mobile App", "AI/ML", "Blockchain", "IoT",
        "Game Development", "Data Science", "DevOps", "UI/UX", "Open Source"
    ];

    // Handle image URL validation and preview without CORS issues
    const handleImageUrlChange = async (url: string) => {
        setImagePreview("");
        if (!url) return;

        setIsValidatingImage(true);
        try {
            // Basic URL check
            new URL(url);

            // Use Image() to validate/load cross-origin images without CORS fetch
            const img = new Image();
            img.onload = () => {
                setImagePreview(url);
                setIsValidatingImage(false);
            };
            img.onerror = () => {
                console.log('Invalid image URL or blocked by hotlinking');
                setIsValidatingImage(false);
            };
            img.src = url;
        } catch (error) {
            console.log('Invalid image URL');
            setIsValidatingImage(false);
        }
    };
    const handleFormSubmit = async (prevState: any, formData: FormData) => {
        try {

            const formValues = {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                link: formData.get("link") as string,
                details
            };
            await formSchema.parseAsync(formValues);

            const result = await createProject(prevState, formData, details);

            if (result.status == 'Success') {
                toast({

                    title: "Success",
                    description: "Congratulation 🎉! Your project published successfully."
                });


                router.push(`/project/${result._id}`)
            }

            return result;

        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = error.flatten().fieldErrors;

                setErrors(fieldErrors as unknown as Record<string, string>);
                toast({

                    title: "Error",
                    description: "Error ❌ - Please fill fields carefully"
                });
                return { ...prevState, error: "Validation Error", status: "Error" }
            }

            toast({

                title: "Error",
                description: "Error ❌ - An Unknows Error Occured!"
            });
            return { ...prevState, error: "An unknown error occured", status: "Error" };
        }
    }

    const [state, formAction, isPending] = useActionState(handleFormSubmit, { error: "", status: "INITIAL" });


    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Showcase Your Project
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Share your amazing project with the developer community. Fill out the details below to create a professional showcase.
                </p>
            </div>

            <form action={formAction} className="space-y-8">
                {/* Project Basics Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Project Basics
                        </CardTitle>
                        <CardDescription>
                            Start with the essential information about your project
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                Project Title *
                            </label>
                            <Input
                                id="title"
                                name="title"
                                className="h-12"
                                required
                                placeholder="e.g., AI-Powered Task Manager, E-commerce Platform, Mobile Game..."
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Short Description *
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                className="min-h-[100px] resize-none"
                                required
                                placeholder="A brief, compelling description of what your project does and why it's awesome..."
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Category & Visual Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Category & Visual
                        </CardTitle>
                        <CardDescription>
                            Help others discover your project and make it visually appealing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Category */}
                        <div className="space-y-3">
                            <label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Category *
                            </label>
                            <Input
                                id="category"
                                name="category"
                                className="h-12"
                                required
                                placeholder="e.g., Web Development, Mobile App, AI/ML, Blockchain..."
                            />
                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}

                            {/* Popular Categories */}
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Popular categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {popularCategories.map((cat) => (
                                        <Badge
                                            key={cat}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                            onClick={() => {
                                                const categoryInput = document.getElementById('category') as HTMLInputElement;
                                                if (categoryInput) categoryInput.value = cat;
                                            }}
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-3">
                            <label htmlFor="link" className="text-sm font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Project Thumbnail URL *
                            </label>
                            <Input
                                id="link"
                                name="link"
                                className="h-12"
                                required
                                placeholder="https://example.com/your-project-image.jpg"
                                onChange={(e) => handleImageUrlChange(e.target.value)}
                            />
                            {errors.link && <p className="text-sm text-destructive">{errors.link}</p>}

                            {/* Image Preview */}
                            {isValidatingImage && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    Validating image...
                                </div>
                            )}

                            {imagePreview && (
                                <div className="space-y-2">
                                    <p className="text-sm text-green-600 font-medium">✓ Image preview:</p>
                                    <div className="relative w-full max-w-md mx-auto">
                                        <SafeImage
                                            src={imagePreview}
                                            alt="Project preview"
                                            width={400}
                                            height={192}
                                            className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                            fallbackSrc="https://placehold.co/400x192/e2e8f0/64748b?text=Preview"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Project Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detailed Description
                        </CardTitle>
                        <CardDescription>
                            Tell the full story of your project using Markdown formatting
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3" data-color-mode="light">
                            <label htmlFor="details" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Project Details *
                            </label>

                            <div className="border rounded-lg overflow-hidden">
                                <MDEditor
                                    value={details}
                                    onChange={(value) => setDetails(value as string)}
                                    id="details"
                                    preview="edit"
                                    height={350}
                                    textareaProps={{
                                        placeholder: `# My Awesome Project

## 🚀 What it does
Describe what your project does and its main features...

## 🛠️ Built with
- Technology 1
- Technology 2
- Technology 3

## 💡 Inspiration
What inspired you to build this project?

## 🎯 Challenges
What challenges did you face and how did you overcome them?

## 🔗 Links
- [Live Demo](https://your-demo-link.com)
- [GitHub Repository](https://github.com/username/repo)
- [Documentation](https://your-docs-link.com)

## 📸 Screenshots
![Screenshot](https://your-screenshot-url.com)`
                                    }}
                                    previewOptions={{
                                        disallowedElements: ["style"]
                                    }}
                                />
                            </div>
                            {errors.details && <p className="text-sm text-destructive">{errors.details}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                    <Button
                        type="submit"
                        size="lg"
                        className="px-8 py-3 text-lg font-semibold"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Publishing Project...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5 mr-2" />
                                Publish Your Project
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ProjectForm