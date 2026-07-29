"use client";

import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { FiSend, FiCheckCircle } from "react-icons/fi";

export default function AdminChatPanel() {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // 1. Fetch all active chats
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) return;

    const q = query(collection(db, "chats", selectedChatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Mark as read when opened
    updateDoc(doc(db, "chats", selectedChatId), { unreadByAdmin: false }).catch(console.error);

    return () => unsubscribe();
  }, [selectedChatId]);

  // Find active chat data
  const activeChat = chats.find(c => c.id === selectedChatId);

  // Handle Admin Typing Indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReply(e.target.value);
    if (!selectedChatId) return;

    // Set typing to true
    updateDoc(doc(db, "chats", selectedChatId), { isAdminTyping: true });

    // Clear previous timeout and set a new one to turn typing off after 2 seconds
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      updateDoc(doc(db, "chats", selectedChatId), { isAdminTyping: false });
    }, 2000);
    setTypingTimeout(timeout);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedChatId) return;

    const text = reply.trim();
    setReply("");
    
    // Clear typing indicator immediately upon send
    if (typingTimeout) clearTimeout(typingTimeout);
    await updateDoc(doc(db, "chats", selectedChatId), { isAdminTyping: false });

    try {
      await addDoc(collection(db, "chats", selectedChatId, "messages"), {
        text: text,
        sender: "admin",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", selectedChatId), {
        lastMessage: `Admin: ${text}`,
        updatedAt: serverTimestamp(),
        status: "active" // Ensure it remains active if replied to
      });
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const endChat = async () => {
    if (!selectedChatId) return;
    if (confirm("Are you sure you want to mark this chat as completed?")) {
      await updateDoc(doc(db, "chats", selectedChatId), {
        status: "completed",
        isAdminTyping: false,
        isUserTyping: false
      });
      setSelectedChatId(null); // Close window
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-8 flex gap-6">
      
      {/* Sidebar: List of Chats */}
      <div className="w-1/3 bg-stone-900 border border-stone-800 p-4 h-[80vh] overflow-y-auto shadow-2xl">
        <h2 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-6">Live Inbox</h2>
        {chats.filter(c => c.status !== "completed").length === 0 && (
          <p className="text-xs text-stone-500 uppercase">No active chats.</p>
        )}
        {chats.filter(c => c.status !== "completed").map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={`p-4 border-b border-stone-800 cursor-pointer transition ${
              selectedChatId === chat.id ? "bg-stone-800 border-l-2 border-l-amber-500" : "hover:bg-stone-950"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-stone-100">{chat.userEmail}</span>
              {chat.unreadByAdmin && <span className="bg-amber-500 w-2 h-2 rounded-full"></span>}
            </div>
            <p className="text-xs text-stone-400 truncate">{chat.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Main Panel: Chat Messages */}
      <div className="w-2/3 bg-stone-900 border border-stone-800 flex flex-col h-[80vh] shadow-2xl">
        {selectedChatId && activeChat ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-amber-400 uppercase tracking-widest text-sm mb-1">Chatting with</h3>
                <p className="text-stone-100 text-lg">{activeChat.userEmail}</p>
              </div>
              <button 
                onClick={endChat}
                className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-4 py-2 text-xs uppercase tracking-widest text-stone-400 hover:text-amber-400 hover:border-amber-400 transition"
              >
                <FiCheckCircle /> Mark Completed
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] text-sm p-4 rounded-lg shadow-md ${
                      msg.sender === "admin" ? "bg-amber-500 text-stone-950 font-medium rounded-br-none" : "bg-stone-800 text-stone-200 rounded-bl-none"
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* User Typing Indicator */}
              {activeChat.isUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-800 text-stone-400 text-xs italic p-3 rounded-lg rounded-bl-none">
                    Customer is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleReply} className="p-4 bg-stone-950 border-t border-stone-800 flex gap-4">
              <input
                type="text"
                value={reply}
                onChange={handleTyping}
                placeholder="Reply to customer..."
                className="flex-1 bg-stone-900 border border-stone-800 p-4 text-sm focus:border-amber-400 outline-none transition"
              />
              <button type="submit" className="bg-amber-500 text-stone-950 px-8 font-bold hover:bg-amber-400 uppercase text-xs tracking-widest transition">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-500 uppercase tracking-widest text-xs">
            Select an active conversation
          </div>
        )}
      </div>
    </div>
  );
}