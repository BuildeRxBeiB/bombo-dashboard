"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BomboLogo } from "@/components/ui/bombo-logo";
import {
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  Menu,
  X
} from "lucide-react";

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const sections: NavSection[] = [
  { id: "hero", label: "Overview", icon: BarChart3 },
  { id: "financial", label: "Financials", icon: DollarSign },
  { id: "engagement", label: "Engagement", icon: Activity },
];

export function NavigationSidebar() {
  const [activeSection, setActiveSection] = React.useState("hero");
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-black border border-gray-800 rounded-lg md:hidden"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 z-40 transition-transform duration-300",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex justify-center">
              <BomboLogo className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-gray-900 group",
                    isActive && "bg-gray-900 border-l-2 border-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "w-4 h-4",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                    )}>
                      {section.label}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "w-3 h-3 transition-opacity",
                    isActive ? "text-white opacity-100" : "text-gray-600 opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}