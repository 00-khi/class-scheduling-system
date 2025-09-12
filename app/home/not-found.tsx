"use client";

import { Button } from "@/ui/shadcn/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 text-center">
        <div>
          <h1 className="text-9xl font-extrabold tracking-widest">404</h1>
          <p className="text-sm text-muted-foreground font-semibold">Page Not Found</p>
        </div>

        <div className="w-16 h-1 rounded-full bg-muted"></div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Whoops! This page doesn't exist.
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            It looks like the page you were trying to access has been moved or
            never existed. Please check the URL for errors or click the button
            below to return to the home page.
          </p>
        </div>

        <Button asChild>
          <Link href="/home">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
