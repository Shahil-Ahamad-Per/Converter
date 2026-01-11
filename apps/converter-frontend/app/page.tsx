import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 md:py-32 px-4 text-center space-y-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span className="flex items-center gap-1">
              New: Intelligent Image Processing
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Shape Your Files <br className="hidden md:block" /> with Precision.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            The all-in-one platform for converting, merging, and editing your
            documents and images. Fast, secure, and beautifully designed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/pdf">
            <Button
              size="lg"
              className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all"
            >
              <FileText className="mr-2 h-5 w-5" />
              Manage PDFs
            </Button>
          </Link>
          <Link href="/image">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50"
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Edit Images
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            title="Lightning Fast"
            description="Powered by advanced processing engines for instant results, preserving quality."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-green-500" />}
            title="Secure & Private"
            description="Your files are processed securely and deleted automatically. We value your privacy."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-blue-500" />}
            title="Universal Support"
            description="Convert between hundreds of formats including PDF, DOCX, PNG, SVG, and more."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 inline-block p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
