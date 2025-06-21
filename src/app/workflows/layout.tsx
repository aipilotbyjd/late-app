'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Save, Map, Grid, Zap, Search, Settings, HelpCircle, Bell, User, ChevronDown } from "lucide-react";

export default function WorkflowsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [searchTerm, setSearchTerm] = useState('');

    // This is a placeholder for demonstration. In a real app, you'd pass this down to child components or use context.
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <motion.div
                className="bg-white border-b border-gray-200 h-12 flex items-center px-4 shrink-0 shadow-sm"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
            >
                <div className="flex items-center space-x-6">
                    <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-base font-semibold text-gray-900">n8n</h1>
                    </motion.div>
                    <motion.div
                        className="flex items-center space-x-1 text-sm font-medium text-gray-600 cursor-pointer"
                        whileHover={{ color: '#4F46E5' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Workflows</span>
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                    <motion.div
                        className="flex items-center space-x-1 text-sm font-medium text-gray-600 cursor-pointer"
                        whileHover={{ color: '#4F46E5' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Executions</span>
                    </motion.div>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100"><Settings className="w-4 h-4" /></Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100"><HelpCircle className="w-4 h-4" /></Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100 relative">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>
                        </motion.div>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" className="h-8 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mr-2">U</div>
                                User
                                <ChevronDown className="w-4 h-4 ml-1" />
                            </Button>
                        </motion.div>
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
