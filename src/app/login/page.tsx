import Link from "next/link";
import { LoginForm } from "@/components/auth-forms/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-serif text-3xl">Log in</h1>
      <p className="mt-2 text-sm text-muted">
        New here? <Link href="/signup" className="text-accent hover:underline">Create an account</Link>
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
