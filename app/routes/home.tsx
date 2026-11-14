import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  BookOpen,
  Brain,
  Clock,
  Target,
  Zap,
  Users,
  Shield,
  Bell,
  CreditCard,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HSGS: Hackathon 2025 - AI-Powered Exercise Generation" },
    {
      name: "description",
      content:
        "Generate high-quality exercises and quizzes across multiple subjects with AI. Perfect for exam preparation and reducing teaching workload.",
    },
  ];
}

export default function Home() {
  const features: Array<{
    icon: typeof Brain;
    title: string;
    description: string;
    badge?: string;
  }> = [
    {
      icon: Brain,
      title: "AI-Powered Generation",
      description:
        "Generate exercises with high accuracy using advanced AI algorithms tailored to your curriculum.",
    },
    {
      icon: BookOpen,
      title: "Multiple Subjects",
      description:
        "Support for various subjects and topics, covering all your educational needs.",
    },
    {
      icon: Target,
      title: "Exam Preparation",
      description:
        "Create targeted practice materials to help students prepare effectively for tests and examinations.",
    },
    {
      icon: Clock,
      title: "Time-Saving",
      description:
        "Dramatically reduce the time teachers spend creating exercises and quizzes.",
    },
    {
      icon: Users,
      title: "Reduce Human Resources",
      description:
        "Minimize the workload on educators while maintaining high-quality educational content.",
    },
    {
      icon: Zap,
      title: "Quick & Efficient",
      description:
        "Generate comprehensive exercise sets in seconds, not hours.",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description:
        "Admin-only access to leaderboards and announcements. Secure role-based access control for sensitive features.",
    },
    {
      icon: Bell,
      title: "Parent Notifications",
      description:
        "Coming soon: Automatic notifications to parents about student debts and payment reminders.",
      badge: "Coming Soon",
    },
    {
      icon: CreditCard,
      title: "Debt Management",
      description:
        "Coming soon: Advanced tracking and management of student payment obligations with automated reminder system.",
      badge: "Coming Soon",
    },
  ];

  return (
    <div>
      <section className="home-hero border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Built for educators. Powered by AI.
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Less time creating.<br /><span className="text-primary">More time teaching.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn your curriculum into thoughtful exercises and quizzes with AI.
              Create quality practice materials and give every lesson more room to grow.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 gap-3 px-6">
              <Link to="/problems">Browse Problems <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" /> Multiple subjects</span>
              <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" /> Curriculum-aligned practice</span>
            </div>
          </div>

          {/* Decorative worksheet illustrates the kind of practice educators can create. */}
          <div aria-hidden="true" className="relative mx-auto w-full max-w-md rounded-3xl border border-primary/10 bg-secondary/50 p-4 sm:p-7">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="size-4 text-primary" /> Your next great lesson</div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">PREVIEW</span>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" /> Mathematics <span> / </span> Algebra</div>
                <div><p className="text-lg font-semibold tracking-tight">A little practice.<br />A deeper understanding.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">A sample exercise, ready for a curious mind.</p></div>
                <div className="rounded-xl border border-border bg-background px-4 py-5 text-center font-mono text-xl tracking-wide">2x + 8 = 20</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["A.  x = 4", "B.  x = 6", "C.  x = 8", "D.  x = 10"].map((answer, index) => (
                    <div key={answer} className={`flex items-center justify-between rounded-lg border px-3 py-3 ${index === 1 ? "border-primary/30 bg-primary/5 font-medium text-primary" : "border-border text-muted-foreground"}`}>
                      {answer}{index === 1 && <Check className="size-3.5" />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><Sparkles className="size-3.5 text-primary" /> Thoughtful exercises. In a fraction of the time.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Designed around your classroom</p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need. More time for what matters.</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">Built for educators, optimized for learning, powered by AI.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="min-w-0 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><feature.icon className="size-5" aria-hidden="true" /></span>
                {feature.badge && <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">Coming soon</span>}
              </div>
              <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{feature.description.replace("Coming soon: ", "")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/10 bg-secondary/60 p-6 sm:p-10 md:flex-row md:items-center">
          <div><h2 className="text-2xl font-semibold tracking-tight">Make room for better learning.</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Your next lesson starts with a great set of exercises.</p></div>
          <Button asChild size="lg" className="h-12 shrink-0 gap-3"><Link to="/problems">Explore Problems <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
      </section>
    </div>
  );
}
