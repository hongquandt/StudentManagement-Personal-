import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";
import { useToast } from './ToastContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);
    const { info } = useToast();
    // Get user from local storage
    const getUserId = () => {
        const user = localStorage.getItem('user');
        if (!user) return null;
        try {
            return JSON.parse(user).userId;
        } catch (e) {
            return null;
        }
    };
    
    const userId = getUserId();

    // Re-check user on storage change (login/logout)
    useEffect(() => {
        const handleStorageChange = () => {
             // Reload logic or simpler: force reload window on login/logout so this runs once
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        if (!userId) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7115/chatHub?userId=" + userId)
            .withAutomaticReconnect()
            .build();

        // Register Global Notification Listener BEFORE starting
        newConnection.on("ReceiveMessage", (message) => {
            // Check visibility or URL to decide if we show toast?
            // For now, always show toast. The user will see it.
            // Truncate content
            const preview = message.content.length > 30 ? message.content.substring(0, 30) + "..." : message.content;
            info(`New message: ${preview}`);
        });

        setConnection(newConnection);

        newConnection.start()
            .then(() => console.log('Global Chat Connection Started'))
            .catch(err => console.error('Global Chat Connection Failed', err));

        return () => {
            newConnection.stop();
        };
    }, [userId]);

    return (
        <ChatContext.Provider value={{ connection, userId }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
