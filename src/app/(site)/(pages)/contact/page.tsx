import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact Jibreel Bornat | Professional Web Development Services",
  description: "Contact Jibreel Bornat for affordable professional web development services. Specializing in e-commerce solutions.",
  // other metadata
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
