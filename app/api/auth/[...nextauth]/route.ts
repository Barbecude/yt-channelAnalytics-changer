// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth"; // Import type AuthOptions
import GoogleProvider from "next-auth/providers/google";

// Tambahkan type annotation AuthOptions di sini
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
          
        }
      }
    }),
  ],
  session: {
    strategy: "jwt", // Pastikan strategi session menggunakan JWT
  },
  callbacks: {
    // Tidak perlu ": any" lagi, TS sudah tau tipenya dari file d.ts tadi
    async jwt({ token, account }: any) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
 secret: process.env.NEXTAUTH_SECRET, 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };