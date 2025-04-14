"use client"; // Add this at the top

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/style/globals.css";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      This is dashboard
    </div>
  );
}
