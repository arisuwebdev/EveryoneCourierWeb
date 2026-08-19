import { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { getMessagesService } from "../../api/ApiServices/chat/getMessageService";
import { sendMessageService } from "../../api/ApiServices/chat/sendMessageService";
import { ablyAuthService } from "../../api/ApiServices/chat/ablyAuthService";
import { MessageCircle, Send, Loader2, ChevronUp } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { getJobChatPresenceService } from "../../api/ApiServices/chat/getJobChatPresenceService";

export default function ChatBox({
  jobId,
  currentUserId,
  receiverId,
  otherUserName = "User",
}) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [isReceiverOnline, setIsReceiverOnline] = useState(false);

  const channelRef = useRef(null);
  const clientRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isLoadingOlderRef = useRef(false);

  const presenceSubscribedRef = useRef(false);

  // Used to prevent automatic bottom scrolling
  // when older messages are loaded.
  const shouldScrollToBottomRef = useRef(true);

  // ---------------------------------------
  // Scroll to bottom
  // ---------------------------------------
  const scrollToBottom = (behavior = "smooth") => {
    const container = messagesContainerRef.current;

    if (!container) return;

    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }, 50);
  };

  // ---------------------------------------
  // Initial messages change
  // ---------------------------------------
  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      scrollToBottom("smooth");
    }

    shouldScrollToBottomRef.current = true;
  }, [messages]);

  // ---------------------------------------
  // Load older messages
  // ---------------------------------------
  const loadOlderMessages = async () => {
    if (!jobId || !token) return;

    if (isLoadingOlderRef.current) return;

    // Already reached last page
    if (currentPage >= lastPage) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    isLoadingOlderRef.current = true;
    setLoadingOlder(true);

    // Save scroll information before adding messages
    const oldScrollHeight = container.scrollHeight;
    const oldScrollTop = container.scrollTop;

    try {
      const nextPage = currentPage + 1;

      const response = await getMessagesService(jobId, token, nextPage);

      const olderMessages = response?.payload?.messages ?? [];

      const pagination = response?.payload;

      if (pagination) {
        setCurrentPage(pagination.currentPage ?? nextPage);
        setLastPage(pagination.lastPage ?? lastPage);
      }

      if (olderMessages.length > 0) {
        // Prevent duplicates
        setMessages((prev) => {
          const existingIds = new Set(
            prev.map((message) => String(message.id)),
          );

          const uniqueOlderMessages = olderMessages.filter(
            (message) => !message?.id || !existingIds.has(String(message.id)),
          );

          // Older messages go BEFORE existing messages
          return [...uniqueOlderMessages, ...prev];
        });

        // Don't scroll to bottom
        shouldScrollToBottomRef.current = false;

        // Restore scroll position after DOM update
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;

          container.scrollTop =
            newScrollHeight - oldScrollHeight + oldScrollTop;
        }, 50);
      }
    } catch (error) {
    } finally {
      isLoadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  };

  // ---------------------------------------
  // Detect scroll at top
  // ---------------------------------------
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    // User reached near the top
    if (container.scrollTop <= 80) {
      loadOlderMessages();
    }
  };

  // ---------------------------------------
  // Initial Load + Ably
  // ---------------------------------------
  useEffect(() => {
    if (!jobId || !token) return;

    let isMounted = true;

    const loadChat = async () => {
      try {
        setChatLoading(true);

        // Reset pagination
        setCurrentPage(1);
        setLastPage(1);

        // --------------------------------
        // 1. Get first page
        // --------------------------------
        const response = await getMessagesService(jobId, token, 1);

        if (isMounted) {
          const initialMessages = response?.payload?.messages ?? [];

          setMessages(initialMessages);

          setCurrentPage(response?.payload?.currentPage ?? 1);

          setLastPage(response?.payload?.lastPage ?? 1);

          // Initial chat should go to bottom
          shouldScrollToBottomRef.current = true;
        }

        // --------------------------------
        // 2. Get Ably token
        // --------------------------------
        const ablyResponse = await ablyAuthService(jobId, token);

        if (!ablyResponse?.payload?.tokenRequest) {
          return;
        }

        // --------------------------------
        // 3. Connect Ably
        // --------------------------------
        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              const response = await ablyAuthService(jobId, token);

              const tokenRequest = response?.payload?.tokenRequest;

              if (!tokenRequest) {
                throw new Error("Ably TokenRequest not found");
              }

              callback(null, tokenRequest);
            } catch (error) {
              callback(error, null);
            }
          },
        });

        clientRef.current = client;

        // --------------------------------
        // 4. Job-specific channel
        // --------------------------------
        const channel = client.channels.get(`job-chat-${jobId}`);
        channelRef.current = channel;

        // ===============================
        // ABLY PRESENCE
        // ===============================

        // 1. Listen when another user enters
        await channel.presence.subscribe("enter", (member) => {
          if (!isMounted) return;

          // console.log("🟢 PRESENCE ENTER:", member);
          // console.log("Entered clientId:", member.clientId);
          // console.log("Receiver ID:", receiverId);

          if (String(member.clientId) === String(receiverId)) {
            // console.log("✅ RECEIVER IS ONLINE");
            setIsReceiverOnline(true);
          }
        });

        // 2. Listen when another user leaves
        await channel.presence.subscribe("leave", (member) => {
          if (!isMounted) return;

          // console.log("🔴 PRESENCE LEAVE:", member);
          // console.log("Left clientId:", member.clientId);
          // console.log("Receiver ID:", receiverId);

          if (String(member.clientId) === String(receiverId)) {
            // console.log("❌ RECEIVER IS OFFLINE");
            setIsReceiverOnline(false);
          }
        });

        // 3. Get initial presence
        // This checks whether receiver was already online
        // before the current user entered.

        // 3. Get current users already present in Ably
        try {
          const members = await channel.presence.get();

          // console.log("👥 CURRENT ABLY PRESENCE:", members);
          // console.log("👤 Current User ID:", currentUserId);
          // console.log("👤 Receiver ID:", receiverId);

          const receiverIsOnline = members.some(
            (member) => String(member.clientId) === String(receiverId),
          );

          // console.log("📡 Receiver online:", receiverIsOnline);

          setIsReceiverOnline(receiverIsOnline);
        } catch (error) {
          // console.error("❌ Failed to get Ably presence:", error);
        }
        // 4. Tell Ably that current user entered the chat
        try {
          // console.log("➡️ Entering presence as:", currentUserId);
          await channel.presence.enter();
          // console.log("✅ Successfully entered presence");
        } catch (error) {
          // console.error("Failed to enter chat presence:", error);
        }
        // --------------------------------
        // 5. Listen for new messages
        // --------------------------------
        channel.subscribe("message", (msg) => {
          if (!isMounted) return;

          const newMessage = msg.data;

          setMessages((prev) => {
            // Prevent duplicate message
            if (
              newMessage?.id &&
              prev.some(
                (message) => String(message.id) === String(newMessage.id),
              )
            ) {
              return prev;
            }

            return [...prev, newMessage];
          });

          // New Ably message should scroll bottom
          shouldScrollToBottomRef.current = true;
        });
      } catch (error) {
      } finally {
        if (isMounted) {
          setChatLoading(false);
        }
      }
    };

    loadChat();

    return () => {
      isMounted = false;

      if (channelRef.current) {
        // Leave presence when ChatBox is closed/unmounted
        channelRef.current.presence.leave().catch((error) => {
          // console.error("Failed to leave chat presence:", error);
        });

        channelRef.current.presence.unsubscribe();
        channelRef.current.unsubscribe();

        channelRef.current = null;
      }

      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
    };
  }, [jobId, token]);

  // ---------------------------------------
  // Send message
  // ---------------------------------------
  const handleSend = async () => {
    const text = inputText.trim();

    if (!text) return;

    if (!jobId || !receiverId || !token) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        job_id: jobId,
        receiver_id: receiverId,
        message: text,
      };

      const response = await sendMessageService(payload, token);

      if (response?.status === 1 && response?.payload?.message) {
        const sentMessage = response.payload.message;

        setMessages((prev) => {
          if (
            sentMessage?.id &&
            prev.some((msg) => String(msg.id) === String(sentMessage.id))
          ) {
            return prev;
          }

          return [...prev, sentMessage];
        });

        setInputText("");

        // Scroll to latest message
        shouldScrollToBottomRef.current = true;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[520px] bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
      {/* =========================
          CHAT HEADER
      ========================== */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{otherUserName}</h3>

          <p
            className={`text-xs flex items-center gap-1 ${
              isReceiverOnline ? "text-green-600" : "text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isReceiverOnline ? "bg-green-500" : "bg-slate-400"
              }`}
            />

            {isReceiverOnline ? "Online" : "Offline"}
          </p>
        </div>

        {/* Pagination info */}
        {/* {lastPage > 1 && (
          <div className="text-xs text-slate-400">
            Page {currentPage} of {lastPage}
          </div>
        )} */}
      </div>

      {/* =========================
          MESSAGES
      ========================== */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto p-5 bg-slate-50"
      >
        {/* Loading older messages */}
        {loadingOlder && (
          <div className="flex justify-center items-center gap-2 py-2 mb-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading older messages...
          </div>
        )}

        {/* Show load more hint */}
        {!loadingOlder && currentPage < lastPage && messages.length > 0 && (
          <div className="flex justify-center py-2 mb-2">
            <button
              type="button"
              onClick={loadOlderMessages}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronUp className="w-4 h-4" />
              Load older messages
            </button>
          </div>
        )}

        {chatLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading messages...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-blue-500" />
            </div>

            <p className="font-medium text-slate-700">No messages yet</p>

            <p className="text-sm text-slate-400 mt-1">Start a conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const isMine = Number(msg.sender_id) === Number(currentUserId);

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMine ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
                        isMine
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                      }`}
                    >
                      {msg.message}
                    </div>

                    {msg.created_at && (
                      <span className="text-[10px] mt-1 px-1 text-slate-400">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* =========================
          MESSAGE INPUT
      ========================== */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              disabled={loading}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="
                w-full
                h-11
                px-4
                pr-12
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                text-sm
                text-slate-800
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
                transition
              "
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !inputText.trim()}
            className="
              h-11
              w-11
              min-w-11
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              flex
              items-center
              justify-center
              transition-all
              duration-200
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
            title="Send message"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
