"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export function DataRoomButton() {
  return (
    <a
      href="https://dr.bombocommunity.xyz"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <Button
        size="lg"
        className="bg-white text-black hover:bg-gray-100 border-0 transition-all duration-300 font-medium"
      >
        Go Back to DR
      </Button>
    </a>
  );
}