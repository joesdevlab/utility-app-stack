import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Smartphone, Database, Cpu, Zap, Palette } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "PWA Ready",
    description: "Installs like a native app on iOS and Android",
  },
  {
    icon: Database,
    title: "Supabase",
    description: "Auth, database, and storage out of the box",
  },
  {
    icon: Cpu,
    title: "OpenAI",
    description: "GPT-4o, Whisper, and Vision API helpers",
  },
  {
    icon: Zap,
    title: "Turbopack",
    description: "Lightning fast development builds",
  },
  {
    icon: Palette,
    title: "Shadcn/UI",
    description: "Beautiful, accessible components",
  },
  {
    icon: CheckCircle2,
    title: "TypeScript",
    description: "Strict mode for maximum type safety",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="text-sm">
            Golden Chassis v0.1.0
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your App Starts Here
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            A production-ready Next.js 15 template with PWA support, Supabase auth,
            OpenAI integration, and beautiful UI components. Clone this, skin it, ship it.
          </p>

          <div className="flex gap-4">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              View Docs
            </Button>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-24">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Clone and customize for your project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
              <p className="text-muted-foreground"># Clone the chassis</p>
              <p>cp -r golden-chassis my-new-app</p>
              <p className="text-muted-foreground mt-2"># Update package.json name</p>
              <p className="text-muted-foreground"># Configure .env.local</p>
              <p className="text-muted-foreground"># Start building!</p>
              <p className="mt-2">npm run dev</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
