import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

import { dbConnect } from '@/lib/mongodb';
import Author, { type AuthorDoc } from '@/lib/models/Author';

export const dynamic = 'force-dynamic'

async function updateProfile(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.id) return

  const name = String(formData.get('name') || '')
  const username = String(formData.get('username') || '')
  const email = String(formData.get('email') || '')
  const instagram = String(formData.get('instagram') || '')
  const bio = String(formData.get('bio') || '')

  await dbConnect();
  await Author.findByIdAndUpdate(String(session.id), { name, username, email, instagram, bio });

  redirect(`/user/${session.id}`)
}

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const session = await auth()
  if (!session?.id || session.id !== id) redirect(`/user/${id}`)

  await dbConnect();
  const userDoc = await Author.findById(id).lean<AuthorDoc>();
  const user = userDoc && {
    _id: String((userDoc as any)._id),
    name: (userDoc as any).name,
    username: (userDoc as any).username,
    email: (userDoc as any).email,
    instagram: (userDoc as any).instagram,
    bio: (userDoc as any).bio,
  };
  if (!user) return notFound()

  return (
    <div className='max-w-2xl mx-auto py-10 px-6'>
      <h1 className='text-3xl font-bold mb-6'>Edit Profile</h1>

      <form action={updateProfile} className='space-y-5'>
        <div>
          <label className='block text-sm font-medium mb-1'>Name</label>
          <Input name='name' defaultValue={user.name || ''} required />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Username</label>
          <Input name='username' defaultValue={user.username || ''} required />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Email</label>
          <Input type='email' name='email' defaultValue={user.email || ''} />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Instagram</label>
          <Input name='instagram' placeholder='your_instagram' defaultValue={user.instagram || ''} />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Bio</label>
          <Textarea name='bio' rows={4} defaultValue={user.bio || ''} />
        </div>
        <div className='flex gap-3'>
          <Button type='submit'>Save</Button>
          <Link href={`/user/${id}`}>
            <Button type='button' variant='outline'>Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}