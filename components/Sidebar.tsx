"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scan, Library } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Scan", icon: Scan },
    { href: "/library", label: "Library", icon: Library },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">ReMo-XYZ</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
