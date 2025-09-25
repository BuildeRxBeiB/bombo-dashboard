"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GrowthTrajectory() {
  const growthData = [
    { year: "2023", milestone: "Launch", metric: "$9.7M GTV", description: "Founded with $60K investment" },
    { year: "2024", milestone: "Growth", metric: "$26.4M GTV", description: "485K users, market leader position" },
    { year: "2025 YTD", milestone: "Dominance", metric: "$33.9M GTV", description: "801K users, 80% market share" },
    { year: "2025E", milestone: "Projection", metric: "$51M GTV", description: "1.2M users expected" }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Growth Trajectory
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="relative">
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-600" />

              <div className="space-y-8">
                {growthData.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <div className="relative z-10 w-4 h-4 bg-white rounded-full ml-6" />
                    <div className="ml-8 flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-semibold text-gray-400 mr-3">{item.year}</span>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                          {item.milestone}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold text-white mb-1">{item.metric}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}