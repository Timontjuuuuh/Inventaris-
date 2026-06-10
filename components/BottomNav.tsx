"use client";

import Link from "next/link";
import { Package, Scan, Plus, LayoutDashboard } from "lucide-react";

interface BottomNavProps {
  active: "home" | "onderdelen" | "scan" | "nieuw";
}

export default function BottomNav({ active }: BottomNavProps) {
  const items = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", key: "home" },
    { href: "/onderdelen", icon: Package, label: "Onderdelen", key: "onderdelen" },
    { href: "/scan", icon: Scan, label: "Scannen", key: "scan" },
    { href: "/onderdelen/nieuw", icon: Plus, label: "Toevoegen", key: "nieuw" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pt-2 pb-6">
      <div className="flex justify-around max-w-md mx-auto">
        {items.map(({ href, icon: Icon, label, key }) => (
          <Link
            key={key}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
              active === key
                ? "text-blue-600"
                : "text-slate-400 active:text-slate-600"
            }`}
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
