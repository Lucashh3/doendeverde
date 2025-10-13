import { redirect } from 'next/navigation';

import { PostComposerForm } from '@/components/posts/post-composer-form';
import { fetchCategories } from '@/lib/feed/fetch-feed';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function CreatePostPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in?next=/posts/criar');
  }

  const categories = await fetchCategories();

  return (
    <main style={{ display: 'grid', justifyContent: 'center' }}>
      <PostComposerForm categories={categories} />
    </main>
  );
}
