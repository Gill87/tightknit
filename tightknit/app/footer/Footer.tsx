"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tkFooter } from "./formStyles";
import { AskNavIcon, HomeNavIcon, MessagesNavIcon, YouNavIcon } from "./components/icons";
import { useUnreadChatsCount } from "@/lib/queries/messages";

const tabs = [
  { href: "/home", label: "Home", Icon: HomeNavIcon },
  { href: "/ask", label: "Ask", Icon: AskNavIcon },
  { href: "/messages", label: "Messages", Icon: MessagesNavIcon },
  { href: "/you", label: "You", Icon: YouNavIcon },
] as const;

export function Footer() {
  const pathname = usePathname();
  const unreadChats = useUnreadChatsCount();

  return (
    <nav className={tkFooter.bar} aria-label="Main navigation">
      <ul className={tkFooter.list}>
        {tabs.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          const badge = href === "/messages" && unreadChats > 0 ? unreadChats : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                className={tkFooter.link(active)}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative h-6 w-6">
                  <Icon className={tkFooter.icon(active)} />
                  {badge > 0 && (
                    <span className={tkFooter.navBadge}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
