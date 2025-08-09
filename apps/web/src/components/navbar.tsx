import Link from "next/link";
import AuthButton from "./auth-button";

export default function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link className="flex items-center justify-center" href="/lab">
        <span className="font-semibold">ChartLab</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/lab"
        >
          Lab
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/history"
        >
          History
        </Link>
        <AuthButton />
      </nav>
    </header>
  );
}
