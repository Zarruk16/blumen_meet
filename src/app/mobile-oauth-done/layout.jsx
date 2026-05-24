"use client";

import { SessionProvider } from "next-auth/react";

export default function MobileOAuthDoneLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
