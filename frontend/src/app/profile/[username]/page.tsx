'use client'; // For App Router

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';  
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // shadcn/ui
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Or '/' if no login page
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Redirect handled above

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          {/* Placeholder for Library – fetch from Supabase later */}
          <div>
            <h3 className="font-semibold">Your Library (Saved Content)</h3>
            <p className="text-muted-foreground">No items yet. Start saving from the feed!</p>
            {/* Future: Map over user saves from DB */}
          </div>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}