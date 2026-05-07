const DEV_CSS_HREF = "/src/styles/global.css";

let cssHref: string = DEV_CSS_HREF;

export const assetsConfig = {
  get cssHref(): string {
    return cssHref;
  },
  setCssHref(href: string): void {
    cssHref = href;
  },
};
