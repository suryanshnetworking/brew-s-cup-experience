import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aaruhi-chat`;

const QUICK_PROMPTS = [
  { icon: "☕", label: "Specials", q: "What are today's specials?" },
  { icon: "📅", label: "Reservations", q: "How do I make a reservation?" },
  { icon: "⏰", label: "Hours", q: "What are your hours and where are you located?" },
  { icon: "🌿", label: "Dietary", q: "What dairy-free options do you have?" },
  { icon: "🎂", label: "Events", q: "Tell me about your upcoming events." },
  { icon: "💳", label: "Loyalty", q: "How does your loyalty program work?" },
];

type Msg = { role: "user" | "assistant"; content: string };

async function streamChat({
  messages,
  modality,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  modality: "voice" | "chat";
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, modality }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({ error: "Something went wrong" }));
    onError(data.error || "Something went wrong");
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

function BrewOrb({ speaking, listening }: { speaking: boolean; listening: boolean }) {
  const cls = speaking ? "animate-pulse" : listening ? "animate-ping-slow" : "";
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className={`absolute inset-0 rounded-full bg-accent/30 ${cls}`} />
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
        <span className="text-sm">☕</span>
      </div>
    </div>
  );
}

export default function AaruhiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey there! I'm Aaruhi, your guide to Brew's Cup ☕ Ask me anything about our menu, hours, events, or how to book a table!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechSupport] = useState(() => typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window));
  const [ttsSupport] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Msg[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!ttsSupport || !ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05;
    utt.pitch = 1.0;
    utt.volume = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google UK") || v.name.includes("Karen"));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [ttsSupport, ttsEnabled]);

  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    historyRef.current = [...historyRef.current, userMsg];

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && assistantSoFar.startsWith(chunk) === false) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        if (last?.role === "assistant" && assistantSoFar === chunk) {
          return [...prev, { role: "assistant", content: assistantSoFar }];
        }
        if (last?.role === "user") {
          return [...prev, { role: "assistant", content: assistantSoFar }];
        }
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
      });
    };

    try {
      await streamChat({
        messages: historyRef.current,
        modality: isVoice ? "voice" : "chat",
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => {
          setLoading(false);
          historyRef.current = [...historyRef.current, { role: "assistant", content: assistantSoFar }];
          if (isVoice || ttsEnabled) speak(assistantSoFar);
        },
        onError: (err) => {
          setMessages(prev => [...prev, { role: "assistant", content: err }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Seems our espresso machine hit a snag. Please try again! ☕" }]);
      setLoading(false);
    }
  }, [loading, speak, ttsEnabled]);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      sendMessage(transcript, true);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [sendMessage]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-accent to-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
          aria-label="Open Aaruhi chat"
        >
          <MessageCircle className="w-6 h-6 text-accent-foreground group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col bg-background animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
            <BrewOrb speaking={speaking} listening={listening} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground font-display leading-tight">Aaruhi</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Brew's Cup Concierge</p>
            </div>
            <div className="flex items-center gap-1">
              {ttsSupport && (
                <button
                  onClick={() => { setTtsEnabled(!ttsEnabled); window.speechSynthesis.cancel(); setSpeaking(false); }}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title={ttsEnabled ? "Mute voice" : "Enable voice"}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              <button onClick={() => { setOpen(false); window.speechSynthesis.cancel(); setSpeaking(false); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 border-b border-border bg-card/50">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all whitespace-nowrap border border-border/50"
                  onClick={() => sendMessage(p.q)}
                  disabled={loading}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {msg.role === "assistant" && (
                  <span className="text-lg flex-shrink-0 pb-0.5">☕</span>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                    : "bg-accent text-accent-foreground rounded-br-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2">
                <span className="text-lg">☕</span>
                <div className="bg-secondary px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Brewing</span>
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border bg-card flex items-end gap-2">
            <textarea
              className="flex-1 resize-none bg-secondary text-foreground text-sm rounded-xl px-3 py-2 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none placeholder:text-muted-foreground max-h-20"
              rows={1}
              placeholder="Ask about menu, hours, events…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={loading || listening}
            />
            {speechSupport && (
              <button
                className={`p-2 rounded-xl transition-all ${listening ? "bg-destructive/20 text-destructive ring-2 ring-destructive/50 animate-pulse" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent/20"} border border-border`}
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                title={listening ? "Stop" : "Speak"}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              className="p-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all disabled:opacity-40 border border-border"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
