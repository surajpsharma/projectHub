import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import MultiStepForm from '@/components/projects/MultiStepForm';

export default async function CreateProjectPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <MultiStepForm />
      </div>
    </div>
  );
}
