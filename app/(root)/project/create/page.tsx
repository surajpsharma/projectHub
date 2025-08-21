import { auth } from '@/auth'
import ProjectForm from '@/components/ProjectForm'
import { redirect } from 'next/navigation';

import React from 'react'

const Create = async () => {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ProjectForm />
    </div>
  )
}

export default Create