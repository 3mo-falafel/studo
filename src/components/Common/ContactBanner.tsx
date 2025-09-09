import React from "react";

const ContactBanner = () => {
  return (
    <div className="bg-gray-100 text-black py-6 px-4 w-full border-b-2 border-gray-300">
      <div className="max-w-[1170px] mx-auto">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold mb-3">
            🌟 THIS WEBSITE IS MADE BY <span className="text-blue-600 text-2xl md:text-3xl font-extrabold">JIBREEL BORNAT</span> 🌟
          </p>
          <p className="text-lg md:text-xl font-semibold mb-3">
            Want one like this? Contact me for affordable prices!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-base md:text-lg">
            <a 
              href="mailto:jibreelebornat@gmail.com" 
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-md"
            >
              ✉️ Email Me
            </a>
            <a 
              href="https://wa.me/972599765211" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors shadow-md"
            >
              📱 WhatsApp
            </a>
            <a 
              href="https://facebook.com/jibreel.e.bornat" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-blue-400 transition-colors shadow-md"
            >
              📘 Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactBanner;
