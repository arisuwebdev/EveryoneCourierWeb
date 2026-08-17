// import React, { useEffect, useRef, useState } from "react";
// import * as Ably from "ably";
// import {
//   Send,
//   MessageCircle,
//   Loader2,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useAuth } from "../../lib/AuthContext";
// import { Card } from "@/components/ui/card";

// export default function ChatBox({
//   jobId,
//   customerId,
//   courierId,
//   otherUserName,
//   otherUserProfilePic,
// }) {
//   const { user } = useAuth();

//   const [messages, setMessages] = useState([]);
//   const [messageText, setMessageText] = useState("");
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [loadingHistory, setLoadingHistory] = useState(true);

//   const messagesEndRef = useRef(null);
//   const channelRef = useRef(null);
//   const realtimeRef = useRef(null);

//   /*
//    * Only the customer and courier assigned to this job
//    * should use this channel.
//    */
//   const currentUserId = Number(user?.user_id);

//   const isParticipant =
//     currentUserId === Number(customerId) ||
//     currentUserId === Number(courierId);

//   /*
//    * One separate Ably channel for every job.
//    *
//    * Example:
//    * job-chat-101
//    * job-chat-102
//    */
//   const channelName = `job-chat-${jobId}`;

//   // Scroll to latest message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: "smooth",
//     });
//   }, [messages]);

//   useEffect(() => {
//     if (!jobId || !user || !isParticipant) {
//       return;
//     }

//     const apiKey = import.meta.env.VITE_ABLY_API_KEY;

//     if (!apiKey) {
//     //   console.error("VITE_ABLY_API_KEY is missing");
//       return;
//     }

//     let mounted = true;

//     const initializeChat = async () => {
//       try {
//         /*
//          * Create Ably realtime connection
//          */
//         const realtime = new Ably.Realtime({
//           key: apiKey,
//           clientId: String(currentUserId),
//         });

//         realtimeRef.current = realtime;

//         /*
//          * Connection status
//          */
//         realtime.connection.on((stateChange) => {
//         //   console.log("Ably connection:", stateChange.current);

//           if (!mounted) return;

//           setIsConnected(
//             stateChange.current === "connected"
//           );
//         });

//         /*
//          * Get channel
//          */
//         const channel = realtime.channels.get(channelName);

//         channelRef.current = channel;

//         /*
//          * Load previous messages
//          *
//          * This requires Ably channel history/retention
//          * to be enabled for the channel.
//          */
//         try {
//           const history = await channel.history({
//             limit: 50,
//             direction: "forwards",
//           });

//           if (mounted) {
//             const previousMessages = [];

//             for await (const message of history) {
//               previousMessages.push({
//                 id:
//                   message.id ||
//                   `${message.timestamp}-${Math.random()}`,
//                 senderId: Number(
//                   message.data?.senderId
//                 ),
//                 senderName:
//                   message.data?.senderName || "User",
//                 senderProfilePic:
//                   message.data?.senderProfilePic || "",
//                 text: message.data?.text || "",
//                 timestamp:
//                   message.timestamp ||
//                   Date.now(),
//               });
//             }

//             setMessages(previousMessages);
//           }
//         } catch (historyError) {
//         //   console.warn(
//         //     "Could not load chat history:",
//         //     historyError
//         //   );
//         } finally {
//           if (mounted) {
//             setLoadingHistory(false);
//           }
//         }

//         /*
//          * Subscribe to new messages
//          */
//         await channel.subscribe(
//           "chat-message",
//           (message) => {
//             if (!mounted) return;

//             const incomingMessage = {
//               id:
//                 message.id ||
//                 `${message.timestamp}-${Math.random()}`,
//               senderId: Number(
//                 message.data?.senderId
//               ),
//               senderName:
//                 message.data?.senderName || "User",
//               senderProfilePic:
//                 message.data?.senderProfilePic || "",
//               text: message.data?.text || "",
//               timestamp:
//                 message.timestamp ||
//                 Date.now(),
//             };

//             setMessages((previous) => {
//               /*
//                * Prevent duplicate messages
//                */
//               const alreadyExists = previous.some(
//                 (item) => item.id === incomingMessage.id
//               );

//               if (alreadyExists) {
//                 return previous;
//               }

//               return [...previous, incomingMessage];
//             });
//           }
//         );

//         /*
//          * Wait until Ably is connected
//          */
//         await realtime.connection.once(
//           "connected"
//         );

//         if (mounted) {
//           setIsConnected(true);
//         }
//       } catch (error) {
//         console.error(
//           "Failed to initialize Ably chat:",
//           error
//         );

//         if (mounted) {
//           setIsConnected(false);
//           setLoadingHistory(false);
//         }
//       }
//     };

//     initializeChat();

//     /*
//      * Cleanup
//      */
//     return () => {
//       mounted = false;

//       try {
//         if (channelRef.current) {
//           channelRef.current.unsubscribe();
//         }

//         if (realtimeRef.current) {
//           realtimeRef.current.close();
//         }
//       } catch (error) {
//         // console.error(
//         //   "Ably cleanup error:",
//         //   error
//         // );
//       }

//       channelRef.current = null;
//       realtimeRef.current = null;
//     };
//   }, [
//     jobId,
//     currentUserId,
//     customerId,
//     courierId,
//     isParticipant,
//     channelName,
//   ]);

//   const sendMessage = async () => {
//     const text = messageText.trim();

//     if (!text) {
//       return;
//     }

//     if (!channelRef.current) {
//     //   console.error("Ably channel is not ready");
//       return;
//     }

//     if (!isConnected) {
//     //   console.error("Ably is not connected");
//       return;
//     }

//     if (!isParticipant) {
//     //   console.error(
//     //     "Current user is not a participant in this job"
//     //   );
//       return;
//     }

//     try {
//       setIsSending(true);

//       const message = {
//         senderId: currentUserId,
//         senderName: user?.name || "User",
//         senderProfilePic:
//           user?.profile_pic || "",
//         text,
//       };

//       await channelRef.current.publish(
//         "chat-message",
//         message
//       );

//       setMessageText("");
//     } catch (error) {
//     //   console.error(
//     //     "Failed to send chat message:",
//     //     error
//     //   );
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     /*
//      * Enter = send
//      * Shift + Enter = new line
//      */
//     if (
//       event.key === "Enter" &&
//       !event.shiftKey
//     ) {
//       event.preventDefault();
//       sendMessage();
//     }
//   };

//   const formatMessageTime = (timestamp) => {
//     if (!timestamp) return "";

//     return new Date(timestamp).toLocaleTimeString(
//       [],
//       {
//         hour: "2-digit",
//         minute: "2-digit",
//       }
//     );
//   };

//   if (!isParticipant) {
//     return (
//       <div className="rounded-xl border bg-white p-6 text-center">
//         <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />

//         <p className="font-semibold text-slate-700">
//           Chat unavailable
//         </p>

//         <p className="text-sm text-slate-500 mt-1">
//           You are not a participant in this delivery.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <Card className="overflow-hidden">
//       {/* Chat header */}
//       <div className="border-b bg-white px-4 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Avatar className="w-11 h-11">
//               <AvatarImage
//                 src={otherUserProfilePic || ""}
//                 alt={otherUserName || "User"}
//               />

//               <AvatarFallback>
//                 {otherUserName
//                   ?.charAt(0)
//                   ?.toUpperCase() || "U"}
//               </AvatarFallback>
//             </Avatar>

//             <div>
//               <p className="font-semibold text-slate-800">
//                 {otherUserName || "User"}
//               </p>

//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-2 h-2 rounded-full ${
//                     isConnected
//                       ? "bg-green-500"
//                       : "bg-red-500"
//                   }`}
//                 />

//                 <span className="text-xs text-slate-500">
//                   {isConnected
//                     ? "Online"
//                     : "Connecting..."}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <MessageCircle className="w-5 h-5 text-slate-400" />
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="h-[300px] overflow-y-auto bg-slate-50 p-4">
//         {loadingHistory ? (
//           <div className="flex items-center justify-center h-full">
//             <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center">
//             <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />

//             <p className="font-medium text-slate-600">
//               No messages yet
//             </p>

//             <p className="text-sm text-slate-400 mt-1">
//               Start a conversation with{" "}
//               {otherUserName || "the other person"}.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {messages.map((message) => {
//               const isMine =
//                 Number(message.senderId) ===
//                 currentUserId;

//               return (
//                 <div
//                   key={message.id}
//                   className={`flex ${
//                     isMine
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[75%] ${
//                       isMine
//                         ? "items-end"
//                         : "items-start"
//                     } flex flex-col`}
//                   >
//                     {!isMine && (
//                       <span className="text-xs text-slate-500 mb-1 ml-1">
//                         {message.senderName}
//                       </span>
//                     )}

//                     <div
//                       className={`rounded-2xl px-4 py-2.5 ${
//                         isMine
//                           ? "bg-blue-600 text-white rounded-br-md"
//                           : "bg-white text-slate-800 border rounded-bl-md"
//                       }`}
//                     >
//                       <p className="text-sm whitespace-pre-wrap break-words">
//                         {message.text}
//                       </p>
//                     </div>

//                     <span className="text-[10px] text-slate-400 mt-1 px-1">
//                       {formatMessageTime(
//                         message.timestamp
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}

//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Message input */}
//       <div className="border-t bg-white p-3">
//         <div className="flex gap-2 items-end">
//           <Textarea
//             value={messageText}
//             onChange={(event) =>
//               setMessageText(event.target.value)
//             }
//             onKeyDown={handleKeyDown}
//             placeholder={`Message ${otherUserName || "user"}...`}
//             className="min-h-[45px] max-h-[120px] resize-none"
//             disabled={
//               !isConnected || isSending
//             }
//           />

//           <Button
//             onClick={sendMessage}
//             disabled={
//               !messageText.trim() ||
//               !isConnected ||
//               isSending
//             }
//             className="h-[45px] px-4"
//           >
//             {isSending ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Send className="w-4 h-4" />
//             )}
//           </Button>
//         </div>

//         <p className="text-[11px] text-slate-400 mt-2">
//           Press Enter to send • Shift + Enter for a new line
//         </p>
//       </div>
//     </Card>
//   );
// }

import { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { getMessagesService } from "../../api/ApiServices/chat/getMessageService";
import { sendMessageService } from "../../api/ApiServices/chat/sendMessageService";
import { ablyAuthService } from "../../api/ApiServices/chat/ablyAuthService";
import { MessageCircle, Send, Loader2, ChevronUp } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

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

  const channelRef = useRef(null);
  const clientRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isLoadingOlderRef = useRef(false);

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
      console.error("Failed to load older messages:", error);
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
        console.error("Failed to load/connect chat:", error);
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
      console.error("Failed to send message:", error);
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

          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Chat
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

        {/* <p className="text-[11px] text-slate-400 mt-2 px-1">
          Press Enter to send
        </p> */}
      </div>
    </div>
  );
}
