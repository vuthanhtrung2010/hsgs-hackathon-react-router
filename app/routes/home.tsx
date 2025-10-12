import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { BookOpen, Brain, Clock, Target, Zap, Users, Shield, Bell, CreditCard } from "lucide-react";

interface Course {
  id: string;
  name: string;
  randomId: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HSGS: Hackathon 2025 - AI-Powered Exercise Generation" },
    { name: "description", content: "Generate high-quality exercises and quizzes across multiple subjects with AI. Perfect for exam preparation and reducing teaching workload." },
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
      description: "Generate exercises with high accuracy using advanced AI algorithms tailored to your curriculum.",
    },
    {
      icon: BookOpen,
      title: "Multiple Subjects",
      description: "Support for various subjects and topics, covering all your educational needs.",
    },
    {
      icon: Target,
      title: "Exam Preparation",
      description: "Create targeted practice materials to help students prepare effectively for tests and examinations.",
    },
    {
      icon: Clock,
      title: "Time-Saving",
      description: "Dramatically reduce the time teachers spend creating exercises and quizzes.",
    },
    {
      icon: Users,
      title: "Reduce Human Resources",
      description: "Minimize the workload on educators while maintaining high-quality educational content.",
    },
    {
      icon: Zap,
      title: "Quick & Efficient",
      description: "Generate comprehensive exercise sets in seconds, not hours.",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Admin-only access to leaderboards and announcements. Secure role-based access control for sensitive features.",
    },
    {
      icon: Bell,
      title: "Parent Notifications",
      description: "Coming soon: Automatic notifications to parents about student debts and payment reminders.",
      badge: "Coming Soon",
    },
    {
      icon: CreditCard,
      title: "Debt Management",
      description: "Coming soon: Advanced tracking and management of student payment obligations with automated reminder system.",
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="font-sans min-h-screen">
      {/* Hero Section */}
      <div className="animated-gradient-bg relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animated-gradient-text">
              AI-Powered Exercise Generation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your teaching with intelligent quiz and exercise generation.
              Save time, reduce workload, and deliver high-quality practice materials.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/problems"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Problems
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for educators, optimized for learning, powered by AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow relative"
            >
              {feature.badge && (
                <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                  {feature.badge}
                </span>
              )}
              <div className="mb-4">
                <feature.icon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join us in revolutionizing education with AI-powered exercise generation
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Explore Problems Now
          </Link>
        </div>
      </div>
    </div>
  );
}
