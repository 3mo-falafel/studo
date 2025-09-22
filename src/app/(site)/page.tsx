import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studo.ps | Smart Shopping Experience",
  description:
    "Studo.ps brings a clean, modern shopping experience with performance and thoughtful UX.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
