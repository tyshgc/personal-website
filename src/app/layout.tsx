import type { FC, PropsWithChildren } from "hono/jsx";

import { assetsConfig } from "@/shared/config/assets";
import { primaryNav } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";

type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
  currentPath?: string;
  path?: string;
  ogImage?: string;
}>;

export const Layout: FC<LayoutProps> = ({
  children,
  title,
  description,
  currentPath,
  path,
  ogImage,
}) => {
  const pageTitle = title ? `${title} | ${siteConfig.title}` : siteConfig.title;
  const pageDescription = description ?? siteConfig.description;
  const canonicalPath = path ?? currentPath ?? "/";
  const ogUrl = `${siteConfig.url}${canonicalPath}`;
  const ogImageUrl = `${siteConfig.url}${ogImage ?? "/og/default.png"}`;

  return (
    <html lang={siteConfig.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={ogUrl} />
        <meta property="og:type" content={title ? "article" : "website"} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link rel="stylesheet" href={assetsConfig.cssHref} />
      </head>
      <body class="min-h-screen bg-ink font-sans text-paper antialiased">
        <header class="border-b border-line">
          <div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <a href="/" class="font-mono text-sm tracking-tight text-paper">
              tyshgc.pw
            </a>
            <nav>
              <ul class="flex gap-5 font-mono text-xs text-muted">
                {primaryNav.map((link) => {
                  const isActive = currentPath === link.href;
                  return (
                    <li>
                      <a
                        href={link.href}
                        class={isActive ? "text-accent" : "transition-colors hover:text-paper"}
                      >
                        {link.label.toLowerCase().replace(/\s+/g, "-")}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </header>
        <main class="mx-auto max-w-4xl px-6 py-16">{children}</main>
        <footer class="mt-24 border-t border-line">
          <div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-8 font-mono text-xs text-muted">
            <span>built with hono</span>
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
};
