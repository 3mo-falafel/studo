import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JibShop | Professional E-commerce Solutions by Jibreel Bornat",
  description: "Professional e-commerce website developed by Jibreel Bornat. Contact for affordable web development services.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
