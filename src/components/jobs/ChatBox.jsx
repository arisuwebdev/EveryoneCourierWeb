
import React, { useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import {
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../../lib/AuthContext";
import { Card } from "@/components/ui/card";

export default function ChatBox({
  jobId,
  customerId,
  courierId,
  otherUserName,
  otherUserProfilePic,
}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const realtimeRef = useRef(null);

  /*
   * Only the customer and courier assigned to this job
   * should use this channel.
   */
  const currentUserId = Number(user?.user_id);

  const isParticipant =
    currentUserId === Number(customerId) ||
    currentUserId === Number(courierId);

  /*
   * One separate Ably channel for every job.
   *
   * Example:
   * job-chat-101
   * job-chat-102
   */
  const channelName = `job-chat-${jobId}`;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!jobId || !user || !isParticipant) {
      return;
    }

    const apiKey = import.meta.env.VITE_ABLY_API_KEY;

    if (!apiKey) {
    //   console.error("VITE_ABLY_API_KEY is missing");
      return;
    }

    let mounted = true;

    const initializeChat = async () => {
      try {
        /*
         * Create Ably realtime connection
         */
        const realtime = new Ably.Realtime({
          key: apiKey,
          clientId: String(currentUserId),
        });

        realtimeRef.current = realtime;

        /*
         * Connection status
         */
        realtime.connection.on((stateChange) => {
        //   console.log("Ably connection:", stateChange.current);

          if (!mounted) return;

          setIsConnected(
            stateChange.current === "connected"
          );
        });

        /*
         * Get channel
         */
        const channel = realtime.channels.get(channelName);

        channelRef.current = channel;

        /*
         * Load previous messages
         *
         * This requires Ably channel history/retention
         * to be enabled for the channel.
         */
        try {
          const history = await channel.history({
            limit: 50,
            direction: "forwards",
          });

          if (mounted) {
            const previousMessages = [];

            for await (const message of history) {
              previousMessages.push({
                id:
                  message.id ||
                  `${message.timestamp}-${Math.random()}`,
                senderId: Number(
                  message.data?.senderId
                ),
                senderName:
                  message.data?.senderName || "User",
                senderProfilePic:
                  message.data?.senderProfilePic || "",
                text: message.data?.text || "",
                timestamp:
                  message.timestamp ||
                  Date.now(),
              });
            }

            setMessages(previousMessages);
          }
        } catch (historyError) {
        //   console.warn(
        //     "Could not load chat history:",
        //     historyError
        //   );
        } finally {
          if (mounted) {
            setLoadingHistory(false);
          }
        }

        /*
         * Subscribe to new messages
         */
        await channel.subscribe(
          "chat-message",
          (message) => {
            if (!mounted) return;

            const incomingMessage = {
              id:
                message.id ||
                `${message.timestamp}-${Math.random()}`,
              senderId: Number(
                message.data?.senderId
              ),
              senderName:
                message.data?.senderName || "User",
              senderProfilePic:
                message.data?.senderProfilePic || "",
              text: message.data?.text || "",
              timestamp:
                message.timestamp ||
                Date.now(),
            };

            setMessages((previous) => {
              /*
               * Prevent duplicate messages
               */
              const alreadyExists = previous.some(
                (item) => item.id === incomingMessage.id
              );

              if (alreadyExists) {
                return previous;
              }

              return [...previous, incomingMessage];
            });
          }
        );

        /*
         * Wait until Ably is connected
         */
        await realtime.connection.once(
          "connected"
        );

        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error(
          "Failed to initialize Ably chat:",
          error
        );

        if (mounted) {
          setIsConnected(false);
          setLoadingHistory(false);
        }
      }
    };

    initializeChat();

    /*
     * Cleanup
     */
    return () => {
      mounted = false;

      try {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }

        if (realtimeRef.current) {
          realtimeRef.current.close();
        }
      } catch (error) {
        // console.error(
        //   "Ably cleanup error:",
        //   error
        // );
      }

      channelRef.current = null;
      realtimeRef.current = null;
    };
  }, [
    jobId,
    currentUserId,
    customerId,
    courierId,
    isParticipant,
    channelName,
  ]);

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text) {
      return;
    }

    if (!channelRef.current) {
    //   console.error("Ably channel is not ready");
      return;
    }

    if (!isConnected) {
    //   console.error("Ably is not connected");
      return;
    }

    if (!isParticipant) {
    //   console.error(
    //     "Current user is not a participant in this job"
    //   );
      return;
    }

    try {
      setIsSending(true);

      const message = {
        senderId: currentUserId,
        senderName: user?.name || "User",
        senderProfilePic:
          user?.profile_pic || "",
        text,
      };

      await channelRef.current.publish(
        "chat-message",
        message
      );

      setMessageText("");
    } catch (error) {
    //   console.error(
    //     "Failed to send chat message:",
    //     error
    //   );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    /*
     * Enter = send
     * Shift + Enter = new line
     */
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (!isParticipant) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center">
        <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />

        <p className="font-semibold text-slate-700">
          Chat unavailable
        </p>

        <p className="text-sm text-slate-500 mt-1">
          You are not a participant in this delivery.
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Chat header */}
      <div className="border-b bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage
                src={otherUserProfilePic || ""}
                alt={otherUserName || "User"}
              />

              <AvatarFallback>
                {otherUserName
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold text-slate-800">
                {otherUserName || "User"}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-xs text-slate-500">
                  {isConnected
                    ? "Online"
                    : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          <MessageCircle className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Messages */}
      <div className="h-[300px] overflow-y-auto bg-slate-50 p-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />

            <p className="font-medium text-slate-600">
              No messages yet
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Start a conversation with{" "}
              {otherUserName || "the other person"}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine =
                Number(message.senderId) ===
                currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMine
                        ? "items-end"
                        : "items-start"
                    } flex flex-col`}
                  >
                    {!isMine && (
                      <span className="text-xs text-slate-500 mb-1 ml-1">
                        {message.senderName}
                      </span>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-slate-800 border rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatMessageTime(
                        message.timestamp
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t bg-white p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            value={messageText}
            onChange={(event) =>
              setMessageText(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherUserName || "user"}...`}
            className="min-h-[45px] max-h-[120px] resize-none"
            disabled={
              !isConnected || isSending
            }
          />

          <Button
            onClick={sendMessage}
            disabled={
              !messageText.trim() ||
              !isConnected ||
              isSending
            }
            className="h-[45px] px-4"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          Press Enter to send • Shift + Enter for a new line
        </p>
      </div>
    </Card>
  );
}

