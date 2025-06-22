'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Save, Map, Grid, Zap, Search, Settings, HelpCircle, Bell, User, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

// Layout component for workflows pages, excluding editor page
export default function WorkflowsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isProjectsPage = pathname.startsWith('/projects');
    const pageTitle = isProjectsPage ? 'Projects' : 'Workflows';

    // Exclude layout for editor page
    if (pathname.includes('/workflows/editor') || pathname.includes('/projects/editor')) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <motion.div
                className="bg-white border-b border-gray-200 h-12 flex items-center px-4 shrink-0 shadow-sm"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
            >
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Zap className="w-4 h-4 text-white" />
                        </motion.div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">Quick Actions</Button>
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                                <Zap className="w-3.5 h-3.5" />
                            </Button>
                        </motion.div>
                        <Button variant="outline" size="icon" className="h-7 w-7 p-0">
                            <HelpCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 p-0">
                            <Bell className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 py-0.5">
                            User
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 p-4 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
