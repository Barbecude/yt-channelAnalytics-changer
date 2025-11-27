'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthProfile() {
  const { data: session } = useSession();
  


  return (
    <div className="border border-xs border-gray-200 p-5 rounded-lg flex flex-col gap-3 items-start">
      
      <form className="flex gap-2 w-full">
        <input 
          type="text" 
          placeholder="Search channel..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition"

        />
        <button 
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {/* 2. Kondisional Auth: Cek session hanya untuk bagian user/login */}
      <div className="flex flex-col gap-2 w-full">
        {session ? (
          // TAMPILAN JIKA SUDAH LOGIN
          <div className="flex items-center justify-between w-full mt-2">
            <p className="text-sm">Halo, <strong>{session.user?.name}</strong>! 👋</p>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded-lg py-1 px-3 transition cursor-pointer"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        ) : (
          // TAMPILAN JIKA BELUM LOGIN
          <div className="mt-2">
            <button
              onClick={() => signIn("google")}
              className="
                flex items-center gap-2 max-w-max
                px-4 py-2 
                rounded-lg 
                border border-gray-200 
                shadow-xs
                bg-white text-black text-sm
                font-medium
                hover:bg-gray-50
                transition
                cursor-pointer
                w-full justify-center
              "
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-4 h-4"
              />
              Sign in with Google
            </button>
          </div>
        )}
      </div>

    </div>
  );
}