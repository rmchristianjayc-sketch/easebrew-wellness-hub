import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EaseBrew — Family Wellness Update",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

export default function FamilyShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
