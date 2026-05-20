export type NavLink = {
  href: string;
  label: string;
};

export const primaryNav: ReadonlyArray<NavLink> = [
  { href: "/profile", label: "Profile" },
  { href: "/what-i-deliver", label: "What I Deliver" },
  { href: "/outputs", label: "Outputs" },
  { href: "/externals", label: "Externals" },
  { href: "/inquiry", label: "Inquiry" },
];
