import { useEffect, useRef, useState } from "react";
import Ably from "ably";
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronUp,
  DollarSign,
  Check,
  X,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
// import { getMessagesService } from "../../api/ApiServices/chat/getMessageService";
import { sendMessageService } from "../../api/ApiServices/chat/sendMessageService";
import { ablyAuthService } from "../../api/ApiServices/chat/ablyAuthService";
import { getJobChatPresenceService } from "../../api/ApiServices/chat/getJobChatPresenceService";
import { toast } from "react-toastify";

export default function PaymentIncreaseChatBox({
  jobId,
  currentUserId,
  receiverId,
  otherUserName = "User",

  // New job-flow props
  jobPrice = 0,
  agreedPrice = null,
  jobStatus = "",
  userType = "",
}) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [isReceiverOnline, setIsReceiverOnline] = useState(false);

  // Price revision
  const [showPriceRevision, setShowPriceRevision] = useState(false);
  const [requestedPrice, setRequestedPrice] = useState("");
  const [priceMessage, setPriceMessage] = useState("");
  const [priceSubmitting, setPriceSubmitting] = useState(false);

  // Counter offer
  const [counterRevisionId, setCounterRevisionId] = useState(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [counterSubmitting, setCounterSubmitting] = useState(false);

  // Price action
  const [priceActionLoading, setPriceActionLoading] = useState(null);

  const channelRef = useRef(null);
  const clientRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isLoadingOlderRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);

  /*
   * ---------------------------------------------------------
   * JOB STATUS
   * ---------------------------------------------------------
   */

  const normalizedStatus = String(jobStatus || "").toUpperCase();

  const isAssigned =
    normalizedStatus === "ASSIGNED" ||
    normalizedStatus === "PICKED_UP" ||
    normalizedStatus === "DELIVERED" ||
    normalizedStatus === "COMPLETED";

  /*
   * Price negotiation is available only BEFORE assignment.
   */
  const canNegotiatePrice =
    !isAssigned &&
    (userType === "COURIER" || userType === "BOTH");

  const isCustomer =
    userType === "CUSTOMER" || userType === "BOTH";

  /*
   * ---------------------------------------------------------
   * SCROLL
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * MESSAGE SCROLL EFFECT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  /*
   * ---------------------------------------------------------
   * LOAD OLDER MESSAGES
   * ---------------------------------------------------------
   */

  const loadOlderMessages = async () => {
    if (!jobId || !token) return;

    if (isLoadingOlderRef.current) return;

    if (currentPage >= lastPage) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    isLoadingOlderRef.current = true;
    setLoadingOlder(true);

    const oldScrollHeight = container.scrollHeight;
    const oldScrollTop = container.scrollTop;

    try {
      const nextPage = currentPage + 1;

      const response = await getMessagesService(
        jobId,
        token,
        nextPage
      );

      const olderMessages =
        response?.payload?.messages ?? [];

      const pagination = response?.payload;

      if (pagination) {
        setCurrentPage(
          pagination.currentPage ?? nextPage
        );

        setLastPage(
          pagination.lastPage ?? lastPage
        );
      }

      if (olderMessages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(
            prev.map((message) => String(message.id))
          );

          const uniqueOlderMessages =
            olderMessages.filter(
              (message) =>
                !message?.id ||
                !existingIds.has(String(message.id))
            );

          return [
            ...uniqueOlderMessages,
            ...prev,
          ];
        });

        shouldScrollToBottomRef.current = false;

        setTimeout(() => {
          const newScrollHeight =
            container.scrollHeight;

          container.scrollTop =
            newScrollHeight -
            oldScrollHeight +
            oldScrollTop;
        }, 50);
      }
    } catch (error) {
      console.error(
        "Load older messages error:",
        error
      );
    } finally {
      isLoadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SCROLL HANDLER
   * ---------------------------------------------------------
   */

  const handleMessagesScroll = () => {
    const container =
      messagesContainerRef.current;

    if (!container) return;

    if (container.scrollTop <= 80) {
      loadOlderMessages();
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldScrollToBottomRef.current =
      distanceFromBottom < 100;
  };

  /*
   * ---------------------------------------------------------
   * INITIAL CHAT LOAD + ABLY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!jobId || !token) return;

    let cancelled = false;

    const setupChat = async () => {
      try {
        setChatLoading(true);

        /*
         * Load messages
         */

        shouldScrollToBottomRef.current =
          true;

        /*
         * ---------------------------------------------------
         * ABLY AUTH
         * ---------------------------------------------------
         */

        const ablyResponse =
          await ablyAuthService(
            jobId,
            token
          );

        if (cancelled) return;

        const authToken =
          ablyResponse?.payload?.token ||
          ablyResponse?.token;

        if (!authToken) {
          throw new Error(
            "Ably authentication token not received."
          );
        }

        const client =
          new Ably.Realtime({
            token: authToken,
          });

        clientRef.current = client;

        /*
         * Job-specific channel
         */
        const channel =
          client.channels.get(
            `job-chat-${jobId}`
          );

        channelRef.current = channel;

        /*
         * Receive new messages
         */
        await channel.subscribe(
          "message",
          (ablyMessage) => {
            try {
              const incoming =
                ablyMessage?.data;

              if (!incoming) return;

              const incomingMessage =
                incoming?.message ||
                incoming;

              setMessages((prev) => {
                const incomingId =
                  incomingMessage?.id;

                if (
                  incomingId &&
                  prev.some(
                    (item) =>
                      String(item.id) ===
                      String(incomingId)
                  )
                ) {
                  return prev;
                }

                return [
                  ...prev,
                  incomingMessage,
                ];
              });

              shouldScrollToBottomRef.current =
                true;
            } catch (error) {
              console.error(
                "Ably message error:",
                error
              );
            }
          }
        );

        /*
         * Presence
         */
        try {
          const presenceResponse =
            await getJobChatPresenceService(
              jobId,
              token
            );

          if (!cancelled) {
            const online =
              presenceResponse?.payload
                ?.online_users ??
              presenceResponse?.payload
                ?.online ??
              [];

            setIsReceiverOnline(
              Array.isArray(online)
                ? online.some(
                    (id) =>
                      String(id) ===
                      String(receiverId)
                  )
                : false
            );
          }
        } catch (error) {
          console.error(
            "Presence error:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Chat setup error:",
          error
        );
      } finally {
        if (!cancelled) {
          setChatLoading(false);
        }
      }
    };

    setupChat();

    return () => {
      cancelled = true;

      try {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current.detach();
        }

        if (clientRef.current) {
          clientRef.current.close();
        }
      } catch (error) {
        console.error(
          "Chat cleanup error:",
          error
        );
      }

      channelRef.current = null;
      clientRef.current = null;
    };
  }, [
    jobId,
    token,
    receiverId,
  ]);

  /*
   * ---------------------------------------------------------
   * SEND NORMAL MESSAGE
   * ---------------------------------------------------------
   */

  const handleSendMessage = async () => {
    const text = inputText.trim();

    if (!text) return;

    if (!jobId || !token) return;

    try {
      setLoading(true);

      const payload = {
        job_id: jobId,
        receiver_id: receiverId,
        message: text,
      };

      const response =
        await sendMessageService(
          payload,
          token
        );

      const sentMessage =
        response?.payload?.message ||
        response?.payload ||
        response?.message;

      /*
       * If API returns the created message,
       * immediately show it.
       */
      if (sentMessage) {
        setMessages((prev) => {
          if (
            sentMessage?.id &&
            prev.some(
              (item) =>
                String(item.id) ===
                String(sentMessage.id)
            )
          ) {
            return prev;
          }

          return [
            ...prev,
            sentMessage,
          ];
        });
      }

      setInputText("");

      shouldScrollToBottomRef.current =
        true;

      scrollToBottom("smooth");
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      toast.error(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * REQUEST PRICE REVISION
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * Replace the API section here with your actual
   * backend price-revision endpoint.
   */

  const handleRequestPriceRevision = async () => {
    const price = Number(
      requestedPrice
    );

    if (!price || price <= 0) {
      toast.error(
        "Please enter a valid price."
      );
      return;
    }

    if (
      price === Number(jobPrice)
    ) {
      toast.error(
        "Requested price must be different from the current price."
      );
      return;
    }

    if (!priceMessage.trim()) {
      toast.error(
        "Please explain why you are requesting this price."
      );
      return;
    }

    try {
      setPriceSubmitting(true);

      /*
       * -----------------------------------------------------
       * TODO:
       * Replace this with your actual backend API.
       * -----------------------------------------------------
       */

      const payload = {
        job_id: jobId,
        requested_price: price,
        message: priceMessage.trim(),
      };

      console.log(
        "PRICE REVISION REQUEST:",
        payload
      );

      /*
       * Example:
       *
       * await requestPriceRevision(
       *   payload,
       *   token
       * );
       */

      /*
       * For now send it as a special chat message
       * so the UI can work with the current chat system.
       *
       * Your backend should eventually create a proper
       * price revision record and return its ID/status.
       */

      await sendMessageService(
        {
          job_id: jobId,
          receiver_id: receiverId,
          message: JSON.stringify({
            type: "PRICE_REVISION_REQUEST",
            requested_price: price,
            original_price: Number(jobPrice),
            message:
              priceMessage.trim(),
          }),
          message_type:
            "PRICE_REVISION_REQUEST",
        },
        token
      );

      toast.success(
        "Price revision request sent."
      );

      setShowPriceRevision(false);
      setRequestedPrice("");
      setPriceMessage("");
    } catch (error) {
      console.error(
        "Price revision error:",
        error
      );

      toast.error(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Unable to send price revision request."
      );
    } finally {
      setPriceSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ACCEPT PRICE
   * ---------------------------------------------------------
   */

  const handleAcceptPrice = async (
    revision
  ) => {
    try {
      setPriceActionLoading(
        `accept-${revision.id}`
      );

      /*
       * TODO:
       * Connect your actual backend endpoint.
       *
       * await acceptPriceRevision(
       *   revision.id,
       *   token
       * );
       */

      console.log(
        "ACCEPT PRICE:",
        revision
      );

      toast.success(
        "Price revision accepted."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.msg ||
          "Unable to accept price revision."
      );
    } finally {
      setPriceActionLoading(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * REJECT PRICE
   * ---------------------------------------------------------
   */

  const handleRejectPrice = async (
    revision
  ) => {
    try {
      setPriceActionLoading(
        `reject-${revision.id}`
      );

      /*
       * TODO:
       * Connect your actual backend endpoint.
       */

      console.log(
        "REJECT PRICE:",
        revision
      );

      toast.success(
        "Price revision rejected."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.msg ||
          "Unable to reject price revision."
      );
    } finally {
      setPriceActionLoading(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * COUNTER PRICE
   * ---------------------------------------------------------
   */

  const handleCounterPrice = async (
    revision
  ) => {
    const price =
      Number(counterPrice);

    if (!price || price <= 0) {
      toast.error(
        "Please enter a valid counter price."
      );
      return;
    }

    if (!counterMessage.trim()) {
      toast.error(
        "Please enter a message."
      );
      return;
    }

    try {
      setCounterSubmitting(true);

      /*
       * TODO:
       * Connect actual backend endpoint.
       */

      console.log(
        "COUNTER PRICE:",
        {
          revision_id:
            revision.id,
          requested_price:
            price,
          message:
            counterMessage.trim(),
        }
      );

      toast.success(
        "Counter offer sent."
      );

      setCounterRevisionId(null);
      setCounterPrice("");
      setCounterMessage("");
    } catch (error) {
      toast.error(
        error?.response?.data?.msg ||
          "Unable to send counter offer."
      );
    } finally {
      setCounterSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * PARSE SPECIAL MESSAGE
   * ---------------------------------------------------------
   */

  const getPriceRevisionData = (
    message
  ) => {
    try {
      if (
        message?.type ===
        "PRICE_REVISION_REQUEST"
      ) {
        return message;
      }

      if (
        message?.message_type ===
        "PRICE_REVISION_REQUEST"
      ) {
        if (
          typeof message.message ===
          "string"
        ) {
          try {
            const parsed =
              JSON.parse(
                message.message
              );

            return {
              ...parsed,
              id: message.id,
            };
          } catch {
            return null;
          }
        }

        return {
          ...message,
          id: message.id,
        };
      }

      if (
        typeof message?.message ===
        "string"
      ) {
        try {
          const parsed =
            JSON.parse(
              message.message
            );

          if (
            parsed?.type ===
            "PRICE_REVISION_REQUEST"
          ) {
            return {
              ...parsed,
              id:
                message.id ||
                parsed.id,
            };
          }
        } catch {
          return null;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  /*
   * ---------------------------------------------------------
   * PRICE REVISION CARD
   * ---------------------------------------------------------
   */

  const renderPriceRevision = (
    message,
    revision
  ) => {
    if (!revision) return null;

    const originalPrice =
      Number(
        revision.original_price ||
          jobPrice ||
          0
      );

    const requestedPrice =
      Number(
        revision.requested_price ||
          0
      );

    const status =
      String(
        revision.status ||
          revision.price_revision_status ||
          "PENDING"
      ).toUpperCase();

    const revisionId =
      revision.id ||
      revision.revision_id ||
      message.id;

    const isOwnMessage =
      String(
        message.sender_id ||
          message.user_id
      ) ===
      String(currentUserId);

    return (
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              Price Revision
            </p>

            <p className="text-xs text-slate-500">
              {status}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              Current price
            </span>

            <span className="font-medium">
              ${originalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              Requested price
            </span>

            <span className="font-bold text-green-600">
              ${requestedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {revision.message && (
          <p className="mt-3 text-sm text-slate-600">
            {revision.message}
          </p>
        )}

        {status === "PENDING" &&
          !isOwnMessage &&
          isCustomer &&
          !isAssigned && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleAcceptPrice({
                      ...revision,
                      id: revisionId,
                    })
                  }
                  disabled={
                    priceActionLoading ===
                    `accept-${revisionId}`
                  }
                  className="flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {priceActionLoading ===
                  `accept-${revisionId}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  Accept
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleRejectPrice({
                      ...revision,
                      id: revisionId,
                    })
                  }
                  disabled={
                    priceActionLoading ===
                    `reject-${revisionId}`
                  }
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {priceActionLoading ===
                  `reject-${revisionId}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}

                  Reject
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCounterRevisionId(
                    revisionId
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Counter Offer
              </button>

              {counterRevisionId ===
                revisionId && (
                <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={counterPrice}
                    onChange={(e) =>
                      setCounterPrice(
                        e.target.value
                      )
                    }
                    placeholder="Counter price"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />

                  <textarea
                    value={counterMessage}
                    onChange={(e) =>
                      setCounterMessage(
                        e.target.value
                      )
                    }
                    placeholder="Message"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCounterRevisionId(
                          null
                        )
                      }
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCounterPrice({
                          ...revision,
                          id: revisionId,
                        })
                      }
                      disabled={
                        counterSubmitting
                      }
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {counterSubmitting ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Send Counter"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        {status === "PENDING" &&
          isOwnMessage && (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
              Waiting for {otherUserName} to respond.
            </div>
          )}

        {status === "ACCEPTED" && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700">
            Price agreed: $
            {requestedPrice.toFixed(2)}
          </div>
        )}

        {status === "REJECTED" && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
            Price revision rejected.
          </div>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (chatLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl border bg-white">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading chat...
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {otherUserName}
            </h3>

            <p className="text-xs">
              {isReceiverOnline ? (
                <span className="text-green-600">
                  Online
                </span>
              ) : (
                <span className="text-slate-400">
                  Offline
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CURRENT / AGREED PRICE */}
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {agreedPrice
              ? "Agreed price"
              : "Job price"}
          </p>

          <p className="font-bold text-slate-900">
            $
            {Number(
              agreedPrice ??
                jobPrice ??
                0
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* ASSIGNED NOTICE */}
      {isAssigned && (
        <div className="border-b bg-slate-50 px-4 py-2 text-center text-xs text-slate-600">
          This job has been assigned. Price
          negotiation is no longer available.
        </div>
      )}

      {/* MESSAGES */}
      <div
        ref={messagesContainerRef}
        onScroll={
          handleMessagesScroll
        }
        className="flex-1 overflow-y-auto bg-slate-50 p-4"
      >
        {/* LOAD OLDER */}
        {currentPage < lastPage && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={
                loadOlderMessages
              }
              disabled={loadingOlder}
              className="flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm hover:bg-slate-100"
            >
              {loadingOlder ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}

              Load older messages
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageCircle className="mx-auto mb-2 h-10 w-10" />

              <p className="text-sm">
                No messages yet.
              </p>

              <p className="mt-1 text-xs">
                Start a conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(
              (message, index) => {
                const senderId =
                  message.sender_id ??
                  message.user_id ??
                  message.sender?.id;

                const isOwn =
                  String(senderId) ===
                  String(currentUserId);

                const revision =
                  getPriceRevisionData(
                    message
                  );

                if (revision) {
                  return (
                    <div
                      key={
                        message.id ??
                        index
                      }
                      className={`flex ${
                        isOwn
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {renderPriceRevision(
                        message,
                        revision
                      )}
                    </div>
                  );
                }

                const messageText =
                  message.message ??
                  message.text ??
                  "";

                return (
                  <div
                    key={
                      message.id ??
                      index
                    }
                    className={`flex ${
                      isOwn
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isOwn
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-white text-slate-800 shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {messageText}
                      </p>

                      {message.created_at && (
                        <p
                          className={`mt-1 text-[10px] ${
                            isOwn
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}

            <div
              ref={messagesEndRef}
            />
          </div>
        )}
      </div>

      {/* PRICE REVISION FORM */}
      {showPriceRevision &&
        canNegotiatePrice && (
          <div className="border-t bg-green-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />

              <div>
                <p className="font-semibold text-slate-900">
                  Request Price Revision
                </p>

                <p className="text-xs text-slate-500">
                  Current job price: $
                  {Number(
                    jobPrice || 0
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  requestedPrice
                }
                onChange={(e) =>
                  setRequestedPrice(
                    e.target.value
                  )
                }
                placeholder="Enter requested price"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
              />

              <textarea
                value={priceMessage}
                onChange={(e) =>
                  setPriceMessage(
                    e.target.value
                  )
                }
                placeholder="Explain why you are requesting this price..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowPriceRevision(
                      false
                    )
                  }
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleRequestPriceRevision
                  }
                  disabled={
                    priceSubmitting
                  }
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {priceSubmitting ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* INPUT */}
      <div className="border-t bg-white p-3">
        {canNegotiatePrice && (
          <button
            type="button"
            onClick={() =>
              setShowPriceRevision(
                !showPriceRevision
              )
            }
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            <DollarSign className="h-4 w-4" />

            Request Price Revision
          </button>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) =>
              setInputText(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Message ${otherUserName}...`}
            rows={1}
            className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={
              handleSendMessage
            }
            disabled={
              loading ||
              !inputText.trim()
            }
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="mt-1 text-center text-[10px] text-slate-400">
          Press Enter to send • Shift + Enter
          for a new line
        </p>
      </div>
    </div>
  );
}