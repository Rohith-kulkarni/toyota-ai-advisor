import { useEffect, useMemo, useRef, useState } from "react";
import { config } from "./config";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type ChatApiResponse = {
  status: "ok";
  sessionId: string;
  reply: string;
  matchedModels: Array<{
    slug: string;
    name: string;
  }>;
};

type LeadFormState = {
  name: string;
  phone: string;
  city: string;
  interestedModel: string;
  budget: string;
  purchaseTimeline: string;
  notes: string;
};

const QUICK_PROMPTS = [
  "I need a family car under 20 lakh",
  "I want a hybrid SUV",
  "I need a 7-seater",
  "I want a premium Toyota",
];

const emptyLeadForm: LeadFormState = {
  name: "",
  phone: "",
  city: "",
  interestedModel: "",
  budget: "",
  purchaseTimeline: "",
  notes: "",
};

function getStoredSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("toyota_chat_session_id") ?? "";
}

function getStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem("toyota_chat_messages");

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [sessionId, setSessionId] = useState(getStoredSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState<LeadFormState>(emptyLeadForm);
  const [leadSuccess, setLeadSuccess] = useState("");
  const [leadError, setLeadError] = useState("");
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const hasAssistantReply = useMemo(
    () => messages.some((message) => message.role === "assistant"),
    [messages]
  );

  useEffect(() => {
    document.title = "Toyota AI Advisor";
  }, []);

  useEffect(() => {
    localStorage.setItem("toyota_chat_messages", JSON.stringify(messages));
    if (sessionId) {
      localStorage.setItem("toyota_chat_session_id", sessionId);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setError("");
    setLeadSuccess("");
    setLeadError("");
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    try {
      const payload = sessionId
        ? { sessionId, message: trimmedMessage }
        : { message: trimmedMessage };

      const response = await fetch(`${config.apiBaseUrl}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as ChatApiResponse;

      setSessionId(data.sessionId);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => current.slice(0, -1));
      setError("Sorry, something went wrong while sending your message.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handlePromptClick(prompt: string) {
    void sendMessage(prompt);
  }

  function handleResetChat() {
    setMessages([]);
    setInput("");
    setSessionId("");
    setError("");
    setLeadSuccess("");
    setLeadError("");
    setHasSubmittedLead(false);
    setLeadForm(emptyLeadForm);
    localStorage.removeItem("toyota_chat_session_id");
    localStorage.removeItem("toyota_chat_messages");
  }

  async function handleLeadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionId) {
      setLeadError("Start a chat before sharing your details.");
      return;
    }

    if (!leadForm.phone.trim()) {
      setLeadError("Phone is required.");
      return;
    }

    setLeadError("");
    setLeadSuccess("");

    try {
      const leadPayload = {
        sessionId,
        ...Object.fromEntries(
          Object.entries(leadForm).filter(([, value]) => value.trim().length > 0)
        ),
      };

      const response = await fetch(`${config.apiBaseUrl}/leads/from-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }

      setHasSubmittedLead(true);
      setLeadSuccess("Thank you. A Toyota advisor will contact you soon.");
      setLeadForm(emptyLeadForm);
    } catch {
      setLeadError("Sorry, we could not submit your details right now.");
    }
  }

  return (
    <div className="page-shell">
      <main className="app-card">
        <header className="hero">
          <p className="eyebrow">Toyota AI Advisor</p>
          <h1>Find the right Toyota for your needs</h1>
          <p className="subcopy">
            Ask about family cars, hybrids, SUVs, and premium Toyota models. Your chat session
            stays ready for follow-up.
          </p>
        </header>

        <section className="quick-prompts" aria-label="Suggested prompts">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick(prompt)}
              disabled={isSending}
            >
              {prompt}
            </button>
          ))}
        </section>

        <section className="chat-panel" aria-label="Chat window">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h2>Start the conversation</h2>
                <p>Tell us what you need and we’ll suggest Toyota models using the local knowledge base.</p>
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className={message.role === "user" ? "bubble bubble-user" : "bubble bubble-assistant"}
              >
                <span className="bubble-label">{message.role === "user" ? "You" : "Toyota AI"}</span>
                <p>{message.text}</p>
              </article>
            ))}
            <div ref={bottomRef} />
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <form className="message-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your Toyota requirement here..."
              rows={3}
              disabled={isSending}
            />
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={handleResetChat}>
                Reset chat
              </button>
              <button type="submit" className="primary-button" disabled={isSending || !input.trim()}>
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </section>

        {hasAssistantReply ? (
          <section className="lead-card">
            <div className="lead-card-header">
              <div>
                <p className="eyebrow">Lead capture</p>
                <h2>Want a Toyota advisor to contact you?</h2>
              </div>
              {hasSubmittedLead ? <span className="success-pill">Submitted</span> : null}
            </div>

            <form className="lead-form" onSubmit={handleLeadSubmit}>
              <div className="grid-two">
                <label>
                  <span>Name</span>
                  <input
                    value={leadForm.name}
                    onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    placeholder="Rohith"
                  />
                </label>
                <label>
                  <span>Phone *</span>
                  <input
                    value={leadForm.phone}
                    onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                    type="tel"
                    placeholder="9876543210"
                    required
                  />
                </label>
              </div>

              <div className="grid-two">
                <label>
                  <span>City</span>
                  <input
                    value={leadForm.city}
                    onChange={(event) => setLeadForm((current) => ({ ...current, city: event.target.value }))}
                    type="text"
                    placeholder="Hyderabad"
                  />
                </label>
                <label>
                  <span>Interested model</span>
                  <input
                    value={leadForm.interestedModel}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, interestedModel: event.target.value }))
                    }
                    type="text"
                    placeholder="Innova Hycross"
                  />
                </label>
              </div>

              <div className="grid-two">
                <label>
                  <span>Budget</span>
                  <input
                    value={leadForm.budget}
                    onChange={(event) => setLeadForm((current) => ({ ...current, budget: event.target.value }))}
                    type="text"
                    placeholder="20-30 lakh"
                  />
                </label>
                <label>
                  <span>Purchase timeline</span>
                  <input
                    value={leadForm.purchaseTimeline}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, purchaseTimeline: event.target.value }))
                    }
                    type="text"
                    placeholder="Within 1 month"
                  />
                </label>
              </div>

              <label>
                <span>Notes</span>
                <textarea
                  value={leadForm.notes}
                  onChange={(event) => setLeadForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                  placeholder="Looking for hybrid automatic family car"
                />
              </label>

              {leadError ? <div className="alert alert-error">{leadError}</div> : null}
              {leadSuccess ? <div className="alert alert-success">{leadSuccess}</div> : null}

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={!sessionId}>
                  Share my details
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
