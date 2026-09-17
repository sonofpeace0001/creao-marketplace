import Link from "next/link";
import { SignupForm } from "@/components/auth-forms/signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-serif text-3xl">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Already have one? <Link href="/login" className="text-accent hover:underline">Log in</Link>
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  );
}
