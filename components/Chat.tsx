"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { db } from "@/config/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { FiMessageSquare, FiX, FiSend, FiChevronDown, FiChevronUp, FiArrowLeft, FiClock, FiPlus, FiCheckCircle } from "react-icons/fi";

const FAQS = [
  { question: "What are your opening hours?", answer: "We are open Monday to Saturday from 9:00 AM to 8:00 PM." },
  { question: "Do you accept walk-ins?", answer: "Yes, walk-ins are welcome! However, booking online secures your preferred stylist instantly." },
  { question: "How do I verify my bank transfer?", answer: "Upload a screenshot of your transfer receipt after booking. Admin approves it within 5-10 minutes." }
];

interface ChatSession {
  chatId: string;
  email: string;
  status: string;
  createdAt?: any;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"faq" | "chat" | "history">("faq");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Active Chat States
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [chatData, setChatData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mySessions, setMySessions] = useState<ChatSession[]>([]);

  // Load user sessions on mount or login
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
      const storageKey = `jaybliz_sessions_${session.user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const savedSessions = localStorage.getItem(storageKey);
      
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        setMySessions(parsed);
        const latestActive = parsed.find(s => s.status === "active") || parsed[0];
        if (latestActive) {
          setActiveChatId(latestActive.chatId);
          setIsJoined(true);
        }
      }
    }
  }, [session]);

  // Listen to active chat document updates
  useEffect(() => {
    if (!activeChatId) return;
    const unsubscribe = onSnapshot(doc(db, "chats", activeChatId), (docSnap) => {
      if (docSnap.exists()) {
        setChatData(docSnap.data());
      } else {
        setChatData(null);
      }
    });
    return () => unsubscribe();
  }, [activeChatId]);

  // Listen to messages for the active chat
  useEffect(() => {
    if (!activeChatId) return;
    const q = query(collection(db, "chats", activeChatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeChatId]);

  if (pathname?.startsWith("/admin")) return null;

  // Start a brand new separate chat session
  const handleStartNewChat = async () => {
    if (!session?.user?.email) return;

    // Generate a unique chat ID using email + timestamp so it never conflicts with past completed chats
    const cleanEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
    const newChatId = `${cleanEmail}_${Date.now()}`;
    
    setActiveChatId(newChatId);
    setIsJoined(true);
    setCurrentTab("chat");
    setMessages([]);
    setChatData({ status: "active" });

    const newSession: ChatSession = { chatId: newChatId, email: session.user.email, status: "active" };
    const updatedSessions = [newSession, ...mySessions];
    setMySessions(updatedSessions);

    localStorage.setItem(`jaybliz_sessions_${cleanEmail}`, JSON.stringify(updatedSessions));

    try {
      await setDoc(doc(db, "chats", newChatId), {
        userEmail: session.user.email,
        status: "active",
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectSession = (sessionItem: ChatSession) => {
    setActiveChatId(sessionItem.chatId);
    setEmail(sessionItem.email);
    setIsJoined(true);
    setCurrentTab("chat");
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeChatId) return;

    updateDoc(doc(db, "chats", activeChatId), { isUserTyping: true }).catch(() => {});
    
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      updateDoc(doc(db, "chats", activeChatId), { isUserTyping: false }).catch(() => {});
    }, 2000);
    setTypingTimeout(timeout);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    const text = newMessage.trim();
    setNewMessage("");

    if (typingTimeout) clearTimeout(typingTimeout);
    await updateDoc(doc(db, "chats", activeChatId), { isUserTyping: false }).catch(() => {});

    try {
      await setDoc(doc(db, "chats", activeChatId), {
        userEmail: email,
        lastMessage: text,
        updatedAt: serverTimestamp(),
        unreadByAdmin: true,
        status: "active"
      }, { merge: true });

      await addDoc(collection(db, "chats", activeChatId, "messages"), {
        text,
        sender: "user",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsOpen(true)} 
            className="group relative bg-amber-500 text-stone-950 p-4 rounded-full shadow-2xl hover:bg-amber-400 transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-amber-400/30"
          >
            <FiMessageSquare className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-stone-950 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/50">
              Live
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="bg-stone-900/80 border-b border-stone-800/80 px-6 py-4 md:px-10 md:py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {currentTab !== "faq" && (
                <button 
                  onClick={() => setCurrentTab("faq")} 
                  className="text-amber-400 hover:text-amber-300 transition bg-stone-800/60 p-2 rounded-full border border-stone-700/50"
                >
                  <FiArrowLeft className="text-xl" />
                </button>
              )}
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-stone-100 font-bold tracking-wide uppercase">
                  {currentTab === "faq" ? "Help Center & Support" : currentTab === "chat" ? "Live Concierge" : "Conversation History"}
                </h2>
                <p className="text-[11px] text-amber-400 uppercase tracking-[0.2em] font-semibold">Jaybliz Hair Studio & Spa</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex bg-stone-950 border border-stone-800 p-1">
                <button onClick={() => setCurrentTab("faq")} className={`px-4 py-1.5 text-xs uppercase tracking-wider font-semibold transition ${currentTab === "faq" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-stone-200"}`}>FAQ</button>
                <button onClick={() => setCurrentTab("chat")} className={`px-4 py-1.5 text-xs uppercase tracking-wider font-semibold transition ${currentTab === "chat" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-stone-200"}`}>Active Chat</button>
                <button onClick={() => setCurrentTab("history")} className={`px-4 py-1.5 text-xs uppercase tracking-wider font-semibold transition ${currentTab === "history" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-stone-200"}`}>History</button>
              </div>

              <button onClick={() => setIsOpen(false)} className="bg-stone-800/80 p-2.5 rounded-full text-stone-400 hover:text-stone-100 transition border border-stone-700/50">
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          <div className="sm:hidden flex bg-stone-900 border-b border-stone-800 text-center">
            <button onClick={() => setCurrentTab("faq")} className={`flex-1 py-3 text-xs uppercase font-semibold ${currentTab === "faq" ? "text-amber-400 border-b-2 border-amber-400 bg-stone-950/40" : "text-stone-400"}`}>FAQ</button>
            <button onClick={() => setCurrentTab("chat")} className={`flex-1 py-3 text-xs uppercase font-semibold ${currentTab === "chat" ? "text-amber-400 border-b-2 border-amber-400 bg-stone-950/40" : "text-stone-400"}`}>Chat</button>
            <button onClick={() => setCurrentTab("history")} className={`flex-1 py-3 text-xs uppercase font-semibold ${currentTab === "history" ? "text-amber-400 border-b-2 border-amber-400 bg-stone-950/40" : "text-stone-400"}`}>History</button>
          </div>

          <div className="flex-1 overflow-y-auto bg-stone-950 flex flex-col">
            
            {/* FAQ Mode */}
            {currentTab === "faq" && (
              <div className="max-w-3xl mx-auto w-full p-6 md:p-12 my-auto">
                <div className="text-center mb-10">
                  <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold block mb-2">Instant Answers</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-stone-100 font-bold">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-4 mb-10">
                  {FAQS.map((faq, index) => (
                    <div key={index} className="border border-stone-800 bg-stone-900/40 overflow-hidden">
                      <button onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} className="w-full text-left p-5 flex justify-between items-center">
                        <span className="font-medium text-stone-200 text-sm md:text-base">{faq.question}</span>
                        {expandedFaq === index ? <FiChevronUp className="text-amber-400 text-xl" /> : <FiChevronDown className="text-stone-500 text-xl" />}
                      </button>
                      {expandedFaq === index && <div className="p-5 pt-0 text-stone-400 text-sm border-t border-stone-800/60 mt-2 bg-stone-950/30">{faq.answer}</div>}
                    </div>
                  ))}
                </div>

                <div className="text-center p-8 border border-stone-800 bg-stone-900/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <h4 className="font-bold text-stone-100 text-base uppercase tracking-wide mb-1">Need personalized advice?</h4>
                    <p className="text-stone-400 text-xs">Connect directly with our support team securely.</p>
                  </div>
                  <button onClick={() => { if (!isJoined) handleStartNewChat(); setCurrentTab("chat"); }} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3.5 uppercase tracking-widest text-xs transition shadow-lg">
                    Open Live Chat
                  </button>
                </div>
              </div>
            )}

            {/* Chat Mode */}
            {currentTab === "chat" && (
              <div className="h-full flex flex-col max-w-4xl mx-auto w-full border-x border-stone-900 bg-stone-950/80">
                {!session ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-stone-900/80 border border-stone-800 p-8 md:p-10 w-full max-w-md text-center shadow-2xl">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 text-xl">
                        <FiMessageSquare />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-100 uppercase tracking-widest mb-2">Sign In Required</h3>
                      <p className="text-xs text-stone-400 mb-6 leading-relaxed">Please sign into your account to access your private live support session.</p>
                    </div>
                  </div>
                ) : !isJoined ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-stone-900/80 border border-stone-800 p-8 md:p-10 w-full max-w-md text-center shadow-2xl">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 text-xl">
                        <FiMessageSquare />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-100 uppercase tracking-widest mb-2">Start Live Chat</h3>
                      <p className="text-xs text-stone-400 mb-6 leading-relaxed">Connected as <span className="text-amber-400 font-semibold">{session.user?.email}</span></p>
                      <button onClick={handleStartNewChat} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 text-xs uppercase tracking-[0.2em] transition shadow-lg">
                        Start Conversation
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-stone-900/60 border-b border-stone-800 px-6 py-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-stone-400">
                        <span>Account:</span>
                        <span className="text-amber-400 font-semibold">{email}</span>
                      </div>
                      <button onClick={handleStartNewChat} className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition font-semibold uppercase tracking-wider text-[10px]">
                        <FiPlus /> New Chat
                      </button>
                    </div>

                    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
                      <div className="text-center my-2">
                        <span className="bg-stone-900 border border-stone-800 text-stone-400 text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                          {chatData?.status === "completed" ? "🔒 Completed Session" : "🔒 Secure Account Session"}
                        </span>
                      </div>

                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] p-4 text-sm md:text-base rounded-2xl shadow-md leading-relaxed ${
                            msg.sender === "user" ? "bg-amber-500 text-stone-950 font-medium rounded-br-none" : "bg-stone-800 text-stone-200 border border-stone-700/50 rounded-bl-none"
                          }`}>
                            <span className="text-[10px] block uppercase tracking-wider font-bold mb-1 opacity-70">
                              {msg.sender === "user" ? "You" : "Jaybliz Concierge"}
                            </span>
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {chatData?.isAdminTyping && (
                        <div className="flex justify-start">
                          <div className="bg-stone-900 border border-stone-800 text-stone-400 text-xs italic px-4 py-3 rounded-xl rounded-bl-none animate-pulse">
                            Concierge is typing...
                          </div>
                        </div>
                      )}
                    </div>

                    {chatData?.status === "completed" ? (
                      <div className="p-6 bg-stone-900 border-t border-stone-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-stone-400 uppercase tracking-wider">This conversation has been completed by admin.</p>
                        <button 
                          onClick={handleStartNewChat}
                          className="bg-amber-500 text-stone-950 font-bold px-6 py-3 text-xs uppercase tracking-widest hover:bg-amber-400 transition shadow-lg flex items-center gap-2"
                        >
                          <FiPlus /> Start New Chat
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={sendMessage} className="p-4 md:p-6 bg-stone-900 border-t border-stone-800 flex gap-4">
                        <input type="text" value={newMessage} onChange={handleTyping} placeholder="Type your message..." className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-sm md:text-base p-4 outline-none focus:border-amber-400 transition shadow-inner" />
                        <button type="submit" disabled={!newMessage.trim()} className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 md:px-8 disabled:opacity-40 transition shadow-lg flex items-center justify-center">
                          <FiSend className="text-xl" />
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {/* History Mode */}
            {currentTab === "history" && (
              <div className="max-w-3xl mx-auto w-full p-6 md:p-12 my-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">Archive</span>
                    <h3 className="font-serif text-2xl md:text-3xl text-stone-100 font-bold">Your Saved Chats</h3>
                  </div>
                  <button onClick={handleStartNewChat} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 text-xs uppercase tracking-wider transition flex items-center gap-2">
                    <FiPlus /> New Chat
                  </button>
                </div>

                {!session ? (
                  <div className="text-center py-16 border border-stone-800 bg-stone-900/40 p-8">
                    <p className="text-stone-400 text-sm">Please sign in to view your chat history.</p>
                  </div>
                ) : mySessions.length === 0 ? (
                  <div className="text-center py-16 border border-stone-800 bg-stone-900/40 p-8">
                    <FiClock className="text-4xl text-stone-600 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm">No saved sessions found for this account.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySessions.map((sessionItem) => (
                      <div key={sessionItem.chatId} onClick={() => handleSelectSession(sessionItem)} className="p-5 border border-stone-800 bg-stone-900/60 cursor-pointer hover:border-amber-400 transition flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400">
                            <FiMessageSquare />
                          </div>
                          <div>
                            <span className="text-stone-200 font-bold text-sm block">{sessionItem.email}</span>
                            <span className={`text-xs uppercase font-semibold ${sessionItem.status === "completed" ? "text-stone-500" : "text-amber-400"}`}>
                              {sessionItem.status}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs uppercase text-amber-400 font-bold">Open →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}