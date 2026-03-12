import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-orange-50/30 to-background">
      <Card className="w-full max-w-md border-gray-200 shadow-xl">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-6">
            <div className="text-8xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              404
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/app">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to App
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
