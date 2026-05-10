"use client";

import { createContext, useContext, useState } from "react";
import { Footer } from "@/app/footer/Footer";

type FooterCtx = { setHidden: (v: boolean) => void };
const FooterContext = createContext<FooterCtx>({ setHidden: () => {} });
export const useFooter = () => useContext(FooterContext);

export function FooterProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <FooterContext.Provider value={{ setHidden }}>
      <div
        className={
          hidden
            ? "flex min-h-0 min-w-0 flex-1 flex-col"
            : "flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(4rem+max(0.5rem,env(safe-area-inset-bottom)))]"
        }
      >
        {children}
      </div>
      {!hidden && <Footer />}
    </FooterContext.Provider>
  );
}
