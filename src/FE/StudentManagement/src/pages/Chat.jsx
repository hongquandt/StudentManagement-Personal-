import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import './Chat.css';

const Chat = () => {
    const { connection, userId } = useChat();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);
    
    // Load Contacts
    useEffect(() => {
        if (!userId) return;

        fetch(`https://localhost:7115/api/Chat/contacts/${userId}`)
            .then(res => res.json())
            .then(data => setContacts(data))
            .catch(err => console.error(err));

    }, [userId]);

    // Handle Real-time Messages
    useEffect(() => {
        if (connection) {
            const handleReceiveMessage = (message) => {
                // If the message belongs to the active conversation, add it
                // We access activeChat inside the closure. 
                // CAUTION: activeChat state might be stale in closure unless we use a functional update and check logic,
                // or put activeChat in dependencies.
                // Better approach: Always update messages if sender matches activeChat.
                
                // However, since we can't easily access the current 'activeChat' ref inside this callback without invalidating the effect constantly,
                // we will trust the setState functional update to check ID, OR jus add it and let UI filter? 
                // The current UI just maps 'messages'. 'messages' is loaded from history.
                // So we should only append if the message.senderId === activeChat.userId OR message.receiverId === activeChat.userId (if we sent it from another tab?)
                
                // Let's use a functional update to get access to current state if needed? 
                // Actually, simplest is: just SetMessages(prev => [...prev, msg])
                // BUT we only want to show it if it belongs to THIS chat.
                // We can filter at render time? No, 'messages' state represents the CURRENT conversation.
                
                setMessages(prev => {
                     // We don't have access to 'activeChat' here easily without rebuilding listener.
                     // But we can check if the new message's sender/receiver matches the IDs of the messages already in 'prev' (if any).
                     // Or better, trigger a re-fetch? No, that's slow.
                     
                     // We need 'activeChat' in dependency array?
                     // If we add activeChat to deps, we detach and reattach listener on every chat switch.
                     // useful to keep closure fresh.
                     return prev; 
                });
            };

            // To properly handle activeChat, let's redefine the effect when activeChat changes, 
            // OR use a ref for activeChat.
            // Using a ref is cleaner for SignalR handlers strings.
        }
    }, [connection]);

    // Better implementation using Ref for activeChat to avoid re-binding listeners
    const activeChatRef = useRef(activeChat);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        if (!connection) return;

        const onReceiveMessage = (message) => {
            const currentActive = activeChatRef.current;
            if (currentActive && (message.senderId === currentActive.userId || message.senderId === userId)) {
               setMessages(prev => [...prev, { ...message, isRead: false }]);
            }
        };

        const onMessageSent = (message) => {
            const currentActive = activeChatRef.current;
            if (currentActive && (message.receiverId === currentActive.userId || message.senderId === userId)) {
                setMessages(prev => [...prev, { ...message, isRead: true }]);
            }
        };

        connection.on("ReceiveMessage", onReceiveMessage);
        connection.on("MessageSent", onMessageSent);

        return () => {
            connection.off("ReceiveMessage", onReceiveMessage);
            connection.off("MessageSent", onMessageSent);
        };
    }, [connection, userId]); // Only re-bind if connection changes (or userId)

    // Load History when active chat changes
    useEffect(() => {
        if (activeChat && userId) {
            setMessages([]); // Clear previous
            fetch(`https://localhost:7115/api/Chat/history/${userId}/${activeChat.userId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error(err));
        }
    }, [activeChat, userId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !connection || !activeChat) return;

        try {
            await connection.invoke("SendMessage", userId, activeChat.userId, inputText);
            setInputText("");
        } catch (e) {
            console.error(e);
        }
    };

    if (!userId) return <div className="p-4">Please login to chat.</div>;

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h3>Messages</h3>
                </div>
                <div className="contacts-list">
                    {contacts.map(u => (
                        <div 
                            key={u.userId} 
                            className={`contact-item ${activeChat?.userId === u.userId ? 'active' : ''}`}
                            onClick={() => setActiveChat(u)}
                        >
                            <div className="contact-avatar">
                                {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : <User size={20} />}
                            </div>
                            <div className="contact-info">
                                <span className="contact-name">{u.fullName || u.username}</span>
                                <span className="contact-role">{u.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div className="contact-avatar small">
                                {activeChat.avatarUrl ? <img src={activeChat.avatarUrl} alt="" /> : <User size={16} />}
                            </div>
                            <span>{activeChat.fullName || activeChat.username}</span>
                        </div>
                        <div className="messages-area">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === userId;
                                return (
                                    <div key={idx} className={`message-bubble ${isMe ? 'me' : 'them'}`}>
                                        <div className="content">{msg.content}</div>
                                        <div className="time">
                                            {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-area">
                            <input 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                            />
                            <button onClick={handleSend} disabled={!inputText.trim()}>
                                <Send size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <MessageCircle size={64} color="#d1d5db" />
                        <p>Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
