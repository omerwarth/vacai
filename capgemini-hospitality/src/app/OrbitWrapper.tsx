"use client";

import { OrbitProvider } from "@kiwicom/orbit-components";
import defaultTheme from "@kiwicom/orbit-components/lib/defaultTheme";

export default function OrbitWrapper({ children }: { children: React.ReactNode }) {
  return <OrbitProvider theme={defaultTheme}>{children}</OrbitProvider>;
}