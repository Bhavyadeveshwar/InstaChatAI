import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <span className="text-2xl font-bold gradient-text tracking-tight">
          slide
        </span>
        <SignUp />
      </div>
    </div>
  );
}
