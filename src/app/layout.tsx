import type { FC, PropsWithChildren } from "hono/jsx";

import { assetsConfig } from "@/shared/config/assets";
import { siteConfig } from "@/shared/config/site";

type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export const Layout: FC<LayoutProps> = ({ children, title, description }) => {
  const pageTitle = title ? `${title} | ${siteConfig.title}` : siteConfig.title;
  const pageDescription = description ?? siteConfig.description;

  return (
    <html lang={siteConfig.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="stylesheet" href={assetsConfig.cssHref} />
      </head>
      <body class="min-h-screen bg-white text-gray-900 antialiased">
        <main class="mx-auto max-w-3xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
};
