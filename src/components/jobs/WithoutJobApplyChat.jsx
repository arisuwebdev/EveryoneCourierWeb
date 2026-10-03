import { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { getNegotiationMessageService } from "../../api/ApiServices/withOutApplyChat/getNegotiationMessageService";
import { sendNegotiationMessageService } from "../../api/ApiServices/withOutApplyChat/sendNegotiationMessageService";

import { negotiationAblyAuthService } from "../../api/ApiServices/withOutApplyChat/negotiationAblyAuthService";
import { MessageCircle, Send, Loader2, ChevronUp } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { sendAgreedAmountService } from "../../api/ApiServices/withOutApplyChat/sendAgreedAmountService";

import { confirmAgreedAmountService } from "../../api/ApiServices/withOutApplyChat/confirmAgreedAmountService";
import { rejectAgreedAmountService } from "../../api/ApiServices/withOutApplyChat/rejectAgreedAmountService";

export default function WithoutJobApplyChat({
  jobId,
  currentUserId,
  receiverId,
  courierId,
  otherUserName = "User",
  showAgreedAmount = false,
}) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chatUserName, setChatUserName] = useState(otherUserName || "Customer");
  const [inputText, setInputText] = useState("");

  const [agreedAmount, setAgreedAmount] = useState("");
  // const [submittedAgreedAmount, setSubmittedAgreedAmount] = useState(null);
  const [submittedAgreedAmount, setSubmittedAgreedAmount] = useState(null);
  const [amountSubmitting, setAmountSubmitting] = useState(false);
  const [amountMessage, setAmountMessage] = useState("");
  const [confirmingAmount, setConfirmingAmount] = useState(false);
  const [rejectingAmount, setRejectingAmount] = useState(false);
  const [amountActionMessage, setAmountActionMessage] = useState("");

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

      const response = await getNegotiationMessageService(
        jobId,
        courierId,
        token,
      );

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
    if (!jobId || !courierId || !token) return;

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
        const response = await getNegotiationMessageService(
          jobId,
          courierId,
          token,
        );
        if (isMounted) {
          const initialMessages = response?.payload?.messages ?? [];

          // Get customer/user name from negotiation API
          const apiOtherPartyName = response?.payload?.other_party?.name;

          if (apiOtherPartyName) {
            setChatUserName(apiOtherPartyName);
          }

          setMessages(initialMessages);
          setCurrentPage(response?.payload?.currentPage ?? 1);
          setLastPage(response?.payload?.lastPage ?? 1);
          shouldScrollToBottomRef.current = true;
        }

        // --------------------------------
        // 2. Get Ably token
        // --------------------------------

        // console.log("ABLY AUTH DATA:", {
        //   jobId,
        //   courierId,
        //   receiverId,
        //   currentUserId,
        // });
        const ablyResponse = await negotiationAblyAuthService(
          jobId,
          courierId,
          token,
        );

        if (!ablyResponse?.payload?.tokenRequest) {
          return;
        }

        // --------------------------------
        // 3. Connect Ably
        // --------------------------------
        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              const response = await negotiationAblyAuthService(
                jobId,
                courierId,
                token,
              );

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
        const channelName =
          ablyResponse?.payload?.channel ||
          `job-negotiation-${jobId}-${courierId}`;

        const channel = client.channels.get(channelName);
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

          // Agreed amount received through Ably
          if (newMessage?.type === "amount" && newMessage?.amount != null) {
            setSubmittedAgreedAmount(Number(newMessage.amount));
          }

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
  }, [jobId, courierId, token]);

  const getAmountStatus = (msg) => {
    return String(msg?.amount_status || "").toUpperCase();
  };

  const isAmountPending = (msg) => {
    return getAmountStatus(msg) === "PENDING";
  };

  const isAmountAccepted = (msg) => {
    return getAmountStatus(msg) === "ACCEPTED";
  };

  const isAmountRejected = (msg) => {
    return getAmountStatus(msg) === "REJECTED";
  };

  const handleAgreeAmount = async () => {
    const amount = Number(agreedAmount);

    if (!jobId || !token) {
      setAmountMessage("Missing job information.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountMessage("Please enter a valid amount.");
      return;
    }

    try {
      setAmountSubmitting(true);
      setAmountMessage("");

      const payload = {
        job_id: jobId,
        amount: amount,
      };

      // console.log("Agree Amount Payload:", payload);

      const response = await sendAgreedAmountService(payload, token);

      // console.log("Agree Amount Response:", response);

      if (response?.status === 1) {
        const amountMessage = response?.payload?.message;

        if (amountMessage) {
          // Courier's newly sent amount starts as PENDING
          const messageWithStatus = {
            ...amountMessage,
            amount_status: amountMessage?.amount_status || "PENDING",
          };

          setMessages((prev) => {
            if (
              messageWithStatus?.id &&
              prev.some(
                (msg) => String(msg.id) === String(messageWithStatus.id),
              )
            ) {
              return prev;
            }

            return [...prev, messageWithStatus];
          });

          setSubmittedAgreedAmount(
            Number(
              response?.payload?.agreed_amount ??
                amountMessage?.amount ??
                amount,
            ),
          );
        }

        setAgreedAmount("");
        setAmountMessage("");
        shouldScrollToBottomRef.current = true;
      } else {
        setAmountMessage(
          response?.msg || "Unable to submit the agreed amount.",
        );
      }
    } catch (error) {
      // console.error("Agree amount error:", error);

      setAmountMessage(
        error?.response?.data?.msg || "Failed to submit the amount.",
      );
    } finally {
      setAmountSubmitting(false);
    }
  };

  const handleConfirmAgreedAmount = async (msg) => {
    if (!jobId || !courierId || !msg?.id || !token) {
      setAmountActionMessage("Missing amount information.");
      return;
    }

    try {
      setConfirmingAmount(true);
      setAmountActionMessage("");

      const payload = {
        job_id: Number(jobId),
        courier_id: Number(courierId),
        message_id: Number(msg.id),
      };

      // console.log("Confirm Agreed Amount Payload:", payload);

      const response = await confirmAgreedAmountService(payload, token);

      // console.log("Confirm Agreed Amount Response:", response);

      if (response?.status === 1) {
        setMessages((prev) =>
          prev.map((message) =>
            String(message.id) === String(msg.id)
              ? {
                  ...message,
                  amount_status: "ACCEPTED",
                }
              : message,
          ),
        );

        setSubmittedAgreedAmount(Number(msg.amount));

        setAmountActionMessage(
          response?.msg || "Amount accepted successfully.",
        );

        shouldScrollToBottomRef.current = false;
      } else {
        setAmountActionMessage(response?.msg || "Unable to confirm amount.");
      }
    } catch (error) {
      // console.error("Confirm agreed amount error:", error);

      setAmountActionMessage(
        error?.response?.data?.msg || "Failed to confirm agreed amount.",
      );
    } finally {
      setConfirmingAmount(false);
    }
  };

  const handleRejectAgreedAmount = async (msg) => {
    if (!jobId || !courierId || !msg?.id || !token) {
      setAmountActionMessage("Missing amount information.");
      return;
    }

    try {
      setRejectingAmount(true);
      setAmountActionMessage("");

      const payload = {
        job_id: Number(jobId),
        courier_id: Number(courierId),
        message_id: Number(msg.id),
      };

      // console.log("Reject Agreed Amount Payload:", payload);

      const response = await rejectAgreedAmountService(payload, token);

      // console.log("Reject Agreed Amount Response:", response);

      if (response?.status === 1) {
        setMessages((prev) =>
          prev.map((message) =>
            String(message.id) === String(msg.id)
              ? {
                  ...message,
                  amount_status: "REJECTED",
                }
              : message,
          ),
        );

        setAmountActionMessage(
          response?.msg || "Amount rejected successfully.",
        );
      } else {
        setAmountActionMessage(response?.msg || "Unable to reject amount.");
      }
    } catch (error) {
      console.error("Reject agreed amount error:", error);

      setAmountActionMessage(
        error?.response?.data?.msg || "Failed to reject agreed amount.",
      );
    } finally {
      setRejectingAmount(false);
    }
  };
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
        courier_id: courierId,
        receiver_id: receiverId,
        message: text,
      };

      const response = await sendNegotiationMessageService(payload, token);

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

  const hasAcceptedCourierAmount = messages.some(
    (msg) =>
      msg?.type === "amount" &&
      Number(msg?.sender_id) === Number(currentUserId) &&
      String(msg?.amount_status).toUpperCase() === "ACCEPTED",
  );

  return (
    <div className="w-full h-[480px] sm:h-[520px] bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
      {/* =========================
          CHAT HEADER
      ========================== */}
      <div className="px-3 py-3 sm:px-5 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900">
            {chatUserName}
          </h3>

          {/* <p
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
          </p> */}
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
        className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50"
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

              const isAmountMessage =
                msg.type === "amount" && msg.amount != null;

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      isMine ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    {isAmountMessage ? (
                      (() => {
                        const amountStatus = getAmountStatus(msg);

                        return (
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              isMine
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm font-medium">
                              Agreed amount: AUD {Number(msg.amount).toFixed(2)}
                            </p>

                            {/* COURIER/SENDER VIEW */}
                            {isMine && (
                              <div className="mt-2">
                                {amountStatus === "PENDING" && (
                                  <span className="text-xs font-medium opacity-90">
                                    Pending
                                  </span>
                                )}

                                {amountStatus === "ACCEPTED" && (
                                  <span className="text-xs font-semibold">
                                    Accepted
                                  </span>
                                )}

                                {amountStatus === "REJECTED" && (
                                  <span className="text-xs font-semibold">
                                    Rejected
                                  </span>
                                )}
                              </div>
                            )}

                            {/* CUSTOMER/RECEIVER VIEW */}
                            {!isMine && amountStatus === "PENDING" && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleConfirmAgreedAmount(msg)
                                    }
                                    disabled={
                                      confirmingAmount || rejectingAmount
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {confirmingAmount
                                      ? "Accepting..."
                                      : "Accept"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRejectAgreedAmount(msg)
                                    }
                                    disabled={
                                      confirmingAmount || rejectingAmount
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {rejectingAmount
                                      ? "Rejecting..."
                                      : "Reject"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* CUSTOMER AFTER ACCEPT */}
                            {!isMine && amountStatus === "ACCEPTED" && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold text-green-600">
                                  Accepted
                                </span>
                              </div>
                            )}

                            {/* CUSTOMER AFTER REJECT */}
                            {!isMine && amountStatus === "REJECTED" && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold text-red-600">
                                  Rejected
                                </span>
                              </div>
                            )}

                            {/* {amountActionMessage &&
                              !isMine &&
                              amountStatus === "PENDING" && (
                                <p className="mt-2 text-xs text-slate-600">
                                  {amountActionMessage}
                                </p>
                              )} */}
                          </div>
                        );
                      })()
                    ) : (
                      // =========================
                      // NORMAL CHAT MESSAGE
                      // =========================
                      <div
                        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm break-words ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                        }`}
                      >
                        {msg.message}
                      </div>
                    )}

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
    AGREED AMOUNT BOX
========================== */}
      {showAgreedAmount && !hasAcceptedCourierAmount && (
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-t bg-blue-50">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
            Agree on Delivery Amount
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={agreedAmount}
                onChange={(e) => {
                  setAgreedAmount(e.target.value);
                  setAmountMessage("");
                }}
                placeholder="Enter amount"
                disabled={amountSubmitting}
                className="w-full h-9 sm:h-10 pl-7 pr-3  rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAgreeAmount}
              disabled={
                amountSubmitting ||
                !agreedAmount ||
                !Number.isFinite(Number(agreedAmount)) ||
                Number(agreedAmount) <= 0
              }
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {amountSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}

              {amountSubmitting ? "Submitting..." : "Agree Amount"}
            </button>
          </div>

          {amountMessage && (
            <p className="mt-2 text-xs text-slate-600" role="status">
              {amountMessage}
            </p>
          )}
        </div>
      )}

      {/* =========================
          MESSAGE INPUT
      ========================== */}
      <div className="p-3 sm:p-4 border-t bg-white">
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
               h-10 sm:h-11
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
             h-10 sm:h-11
w-10 sm:w-11
min-w-10 sm:min-w-11
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
