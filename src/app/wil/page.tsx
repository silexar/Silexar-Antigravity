'use client';
import React from 'react';
import { WilChatInterface } from '@/components/wil/wil-chat-interface';
export default function WilPage() {
    return <div className="container mx-auto py-8"><h1 className="text-2xl font-bold mb-6">WIL Assistant</h1><WilChatInterface /></div>;
}