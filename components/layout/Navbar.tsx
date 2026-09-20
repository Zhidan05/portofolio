"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/profile";
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    navigation.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="container nav-inner">
        <a
          className="brand"
          href="#hero"
          aria-label="Zhidan.dev — Home"
          onClick={() => setOpen(false)}
        >
          <Image src="/assets/zhidan-mark.svg" width={32} height={32} alt="" />
          <span>
            HELSINKI<span className="green">.DEV</span>
          </span>
        </a>
        <span className="nav-codename micro">PROJECT HELSINKI</span>
        <button
          ref={menuButton}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "[ CLOSE × ]" : "[ MENU + ]"}
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
        >
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              onClick={() => {
                setActive(item.id);
                setOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
