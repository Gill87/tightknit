"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tkFooter } from "./formStyles";
import { AskNavIcon, HomeNavIcon, MessagesNavIcon, YouNavIcon } from "./components/icons";

const tabs = [
  { href: "/home", label: "Home", Icon: HomeNavIcon },
  { href: "/ask", label: "Ask", Icon: AskNavIcon },
  { href: "/messages", label: "Messages", Icon: MessagesNavIcon },
  { href: "/you", label: "You", Icon: YouNavIcon },
] as const;

export function Footer() {
  const pathname = usePathname();

  return (
    <nav className={tkFooter.bar} aria-label="Main navigation">
      <ul className={tkFooter.list}>
        {tabs.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={tkFooter.link(active)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={tkFooter.icon(active)} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
