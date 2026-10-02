"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions/profile';
import { profileSchema } from '@/lib/validation';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SafeImage } from '../ui/safe-image';
import { z } from 'zod';
import { User, Mail, FileText, Globe, Github, Twitter, Linkedin, Instagram, Image as ImageIcon, Settings, Save } from 'lucide-react';
import Link from 'next/link';

interface SettingsFormProps {
  initialProfile: {
    name: string;
    username: string;
    email: string;
    bio: string;
    instagram: string;
    github: string;
    portfolio: string;
    twitter: string;
    linkedin: string;
    image: string;
  };
}

export default function SettingsForm({ initialProfile }: SettingsFormProps) {
  const [name, setName] = useState(initialProfile.name);
  const [username, setUsername] = useState(initialProfile.username);
  const [email, setEmail] = useState(initialProfile.email);
  const [bio, setBio] = useState(initialProfile.bio);
  const [instagram, setInstagram] = useState(initialProfile.instagram);
  const [github, setGithub] = useState(initialProfile.github);
  const [portfolio, setPortfolio] = useState(initialProfile.portfolio);
  const [twitter, setTwitter] = useState(initialProfile.twitter);
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin);
  const [image, setImage] = useState(initialProfile.image);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Avatar URL preview helper
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.image);

  const handleAvatarChange = (url: string) => {
    setImage(url);
    if (!url) {
      setAvatarPreview('');
      return;
    }
    const img = new Image();
    img.onload = () => setAvatarPreview(url);
    img.onerror = () => setAvatarPreview('');
    img.src = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToValidate = {
      name,
      username,
      email,
      bio,
      instagram,
      github,
      portfolio,
      twitter,
      linkedin,
      image,
    };

    try {
      setErrors({});
      await profileSchema.parseAsync(dataToValidate);
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
          description: err.errors[0]?.message || "Please fix validation errors.",
          variant: "destructive",
        });
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("username", username);
      formData.set("email", email);
      formData.set("bio", bio);
      formData.set("instagram", instagram);
      formData.set("github", github);
      formData.set("portfolio", portfolio);
      formData.set("twitter", twitter);
      formData.set("linkedin", linkedin);
      formData.set("image", image);

      const res = await updateProfile(null, formData);

      if (res.status === 'Success') {
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated successfully.",
        });
        router.push(`/creators/${res.username || username}`);
      } else {
        toast({
          title: "Update Failed",
          description: res.error || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Profile Settings
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="text-xs font-bold">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card & Avatar */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>Public Profile</span>
            </CardTitle>
            <CardDescription>
              Configure your public name, bio, and developer avatar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 border border-gray-250 dark:border-gray-850 shadow-sm shrink-0">
                <SafeImage
                  src={avatarPreview}
                  alt={name || 'Avatar'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  fallbackSrc="/logo.png"
                  unoptimized
                />
              </div>

              <div className="space-y-1.5 flex-1 w-full">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Avatar Image URL</span>
                </label>
                <Input
                  value={image}
                  onChange={(e) => handleAvatarChange(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                  required
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username *</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                  required
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Public Contact Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="bg-transparent border-gray-200 dark:border-gray-800"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself under 300 characters..."
                className="min-h-[100px] resize-none bg-transparent border-gray-200 dark:border-gray-850"
              />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Portfolios & Social links */}
        <Card className="border-gray-200/60 dark:border-gray-850">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span>Socials & Websites</span>
            </CardTitle>
            <CardDescription>
              Link your professional developer profiles and social media links.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-gray-400" />
                  <span>GitHub Profile URL</span>
                </label>
                <Input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.github && <p className="text-xs text-red-500">{errors.github}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>Portfolio Website URL</span>
                </label>
                <Input
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://john.dev"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.portfolio && <p className="text-xs text-red-500">{errors.portfolio}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Twitter className="w-4 h-4 text-gray-400" />
                  <span>Twitter / X Profile URL</span>
                </label>
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/username"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.twitter && <p className="text-xs text-red-500">{errors.twitter}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <Input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-gray-400" />
                  <span>Instagram Username</span>
                </label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="username_only"
                  className="bg-transparent border-gray-200 dark:border-gray-850"
                />
                {errors.instagram && <p className="text-xs text-red-500">{errors.instagram}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button type="button" variant="outline" className="px-6 py-6 rounded-lg font-bold">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-lg shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
