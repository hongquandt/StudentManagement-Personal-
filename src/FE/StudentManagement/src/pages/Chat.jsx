import React, { useState, useEffect, useRef } from 'react';
import * as signalR from "@microsoft/signalr";
import { Send, User, MessageCircle } from 'lucide-react';
import './Chat.css'; // We'll create this CSS

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // active contact user object
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);
    
    // Auth - assume user is in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.userId;

    useEffect(() => {
        if (!userId) return;

        // Init SignalR
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7115/chatHub?userId=" + userId) // Pass userId
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        // Load Contacts
        fetch(`https://localhost:7115/api/Chat/contacts/${userId}`)
            .then(res => res.json())
            .then(data => setContacts(data))
            .catch(err => console.error(err));

    }, [userId]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to ChatHub');
                    
                    connection.on("ReceiveMessage", (message) => {
                        // If chatting with this sender, add to list
                        setMessages(prev => [...prev, { ...message, isRead: false }]); 
                    });

                    connection.on("MessageSent", (message) => {
                         setMessages(prev => [...prev, { ...message, isRead: true }]); 
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    // Load History when active chat changes
    useEffect(() => {
        if (activeChat && userId) {
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
