import React from 'react';
import { FaTools, FaHardHat } from 'react-icons/fa';
import { MdConstruction } from 'react-icons/md';

const UnderConstruction = () => {

    const siteName = "Arduino Screen Animator"
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-400 p-6">
      <div className="flex items-center gap-4 mb-6">
        <FaHardHat className="text-5xl text-green-500 animate-bounce" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
          Page Under Construction
        </h1>
        <FaTools className="text-5xl text-green-500 animate-spin-slow" />
      </div>

      <p className="text-lg md:text-xl text-green-300 text-center max-w-lg mb-6">
        We're working hard to bring this page to life. Please check back soon!
      </p>

      <MdConstruction className="text-[80px] text-green-600 animate-pulse" />

      <div className="mt-10 text-sm text-green-600">
        &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </div>
  );
};

export default UnderConstruction;