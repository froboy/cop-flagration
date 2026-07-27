import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { useEffect, useState } from "react";

import "./app.css";

export const links: LinksFunction = () => [];

export const meta: MetaFunction = () => [{ title: "Cop Takeover" }];

type Theme = "light" | "dark";

const themeScript = `(() => {
  const storageKey = "theme";
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const theme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
})();`;

function AppLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-black tracking-tight">
              Cop Takeover 🔥
            </a>
            <div className="flex items-center gap-4 text-sm font-medium">
              <a href="/about" className="text-zinc-700 hover:underline dark:text-zinc-200">
                About
              </a>
              <a href="/cities" className="text-zinc-700 hover:underline dark:text-zinc-200">
                Cities
              </a>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Not found" : `Error ${error.status}`;
    message = error.statusText || message;
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">{message}</p>
      </main>
    </AppLayout>
  );
}
