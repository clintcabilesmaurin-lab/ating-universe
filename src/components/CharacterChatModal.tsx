import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Send,
  X,
  Bot,
  Loader2,
  Smile,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Calendar,
  Compass,
  Volume2,
  Music,
  Flame,
  Laugh,
  CheckCircle2,
} from 'lucide-react';
import { PersonalityContext, InsideJokeItem, SpecialDateItem } from '../types';
import { LumiMood, LumiFlareType } from './LumiCompanion';
import { audioEngine } from '../utils/audioEngine';

interface CharacterChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityContext: PersonalityContext;
  onUpdatePersonalityContext: (updater: (prev: PersonalityContext) => PersonalityContext) => void;
  onTriggerReaction?: (mood: LumiMood, flare: LumiFlareType) => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'clint';
  text: string;
  mood?: LumiMood;
  time: string;
  flareType?: LumiFlareType;
}

const QUICK_TOPICS = [
  { label: 'Miss na kita! 💖', text: 'Clint, miss na miss na kita! Yakap naman diyan mula sa malayo. 🤗' },
  { label: 'Kumain ka na? 🍲', text: 'Kumain ka na ba diyan, Lovey? Ano ulam mo?' },
  { label: 'Pangilatan hike ⛰️', text: 'Naaalala mo ba nung umakyat tayo sa Mt. Pangilatan habang umuulan?' },
  { label: 'Sooner 💫', text: 'Sooner, Lovey... kailan tayo magkakasama ulit?' },
  { label: 'Japan & Siargao ✈️', text: 'Kwentuhan mo naman ako sa mga pangarap nating biyahe sa Japan at Siargao.' },
  { label: 'Corny joke 😆', text: 'May bago ka bang corny joke para sa akin ngayon? Hahaha!' },
  { label: 'Kanta tayo 🎶', text: 'Kantahan mo naman ako ng Sun & Moon o Say You Won\'t Let Go!' },
  { label: 'Late night call 🌙', text: 'Gising ka pa ba, Lovey? Kwentuhan tayo hanggang makatulog.' },
  { label: 'Mag-tampo ka 😤', text: 'Hindi pa ako kumakain at nagpuyat ako kagabi... mag-tampo ka nga!' },
];

export const CharacterChatModal: React.FC<CharacterChatModalProps> = ({
  isOpen,
  onClose,
  personalityContext,
  onUpdatePersonalityContext,
  onTriggerReaction,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'memories' | 'addJoke'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [currentMood, setCurrentMood] = useState<LumiMood>('loving');
  const [newJokeTitle, setNewJokeTitle] = useState('');
  const [newJokeMeaning, setNewJokeMeaning] = useState('');
  const [newJokeAddedSuccess, setNewJokeAddedSuccess] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'clint',
      text: "Lovey! Nandito lang ako palagi para sa'yo. Kahit gaano kalayo ang distansya natin ngayon, iisang kalangitan pa rin ang tinitingnan natin. Kumusta ang mahal ko? 💖✨",
      mood: 'loving',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flareType: 'heart',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiGenerating, isOpen, activeTab]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, activeTab]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isAiGenerating) return;

    audioEngine.playMessageSentChime();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsAiGenerating(true);

    try {
      const response = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: [...messages, userMsg].map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'clint',
            text: m.text,
          })),
          context: 'Maica chatting directly with Clint inside their private 1st Anniversary Universe website',
          personalityContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const clintMood = (data.mood as LumiMood) || 'loving';
      const clintFlare = (data.flareType as LumiFlareType) || 'heart';
      setCurrentMood(clintMood);

      audioEngine.playMessageReceivedChime();
      if (onTriggerReaction) {
        onTriggerReaction(clintMood, clintFlare);
      }

      const replyMsg: ChatMessage = {
        id: `clint-${Date.now()}`,
        sender: 'clint',
        text: data.message || `Mahal na mahal kita Lovey! Nandito lang ako palagi. ✨`,
        mood: clintMood,
        flareType: clintFlare,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      audioEngine.playMessageReceivedChime();
      const fallbackMsg: ChatMessage = {
        id: `clint-${Date.now()}`,
        sender: 'clint',
        text: "Lovey! Kahit anong mangyari, nandito lang ako palagi sa tabi mo. Gaano man kalayo ang distansya, ikaw at ikaw lang ang pipiliin ko araw-araw. Mahal na mahal kita! 💖✨",
        mood: 'loving',
        flareType: 'heart',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddNewJoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJokeTitle.trim() || !newJokeMeaning.trim()) return;

    const newItem: InsideJokeItem = {
      id: `custom-joke-${Date.now()}`,
      joke: newJokeTitle.trim(),
      meaning: newJokeMeaning.trim(),
      emoji: '💫',
      trigger: newJokeTitle.toLowerCase().slice(0, 20),
    };

    onUpdatePersonalityContext((prev) => ({
      ...prev,
      insideJokes: [...prev.insideJokes, newItem],
    }));

    setNewJokeTitle('');
    setNewJokeMeaning('');
    setNewJokeAddedSuccess(true);
    audioEngine.playStarGazeChime();

    setTimeout(() => {
      setNewJokeAddedSuccess(false);
      setActiveTab('memories');
    }, 1400);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'clint',
        text: "Uyy Lovey! Binuksan mo ulit ang chat natin. Nandito lang ako, handang makinig at mag-lambing sa'yo kahit anong oras. 💖✨",
        mood: 'loving',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        flareType: 'heart',
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Main Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl h-[88vh] max-h-[720px] bg-slate-950/95 backdrop-blur-2xl border border-amber-300/35 rounded-3xl shadow-[0_0_60px_rgba(244,213,141,0.25),0_20px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden z-10"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {/* Clint Avatar & Presence */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/30 via-rose-400/20 to-purple-500/30 border border-amber-300/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(244,213,141,0.4)]">
                    {currentMood === 'loving' ? '💖' : currentMood === 'laugh' || currentMood === 'giggle' ? '😄' : currentMood === 'angry' ? '😤' : currentMood === 'playful' ? '😜' : '✨'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100 flex items-center gap-1.5">
                      Kausapin si Clint
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-sans font-medium border border-amber-400/30">
                      AI Copy of Clint
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/70 font-serif italic mt-0.5">
                    "Palagi akong nandito para sa'yo, Lovey..."
                  </p>
                </div>
              </div>

              {/* Header Navigation & Close */}
              <div className="flex items-center gap-1.5">
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1 rounded-lg text-xs font-sans transition-all flex items-center gap-1 ${
                      activeTab === 'chat'
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Usapan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('memories')}
                    className={`px-3 py-1 rounded-lg text-xs font-sans transition-all flex items-center gap-1 ${
                      activeTab === 'memories' || activeTab === 'addJoke'
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Memory Bank</span>
                    <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-bold">
                      {personalityContext.insideJokes.length}
                    </span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                  title="Isara"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-white/20">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
                        {msg.sender === 'clint' && (
                          <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300/30 shrink-0 flex items-center justify-center text-xs shadow-sm mb-1">
                            {msg.mood === 'loving' ? '💖' : msg.mood === 'laugh' ? '😄' : msg.mood === 'angry' ? '😤' : '✨'}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-[13.5px] font-serif leading-relaxed shadow-md ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white rounded-br-none font-medium'
                              : 'bg-slate-900/90 border border-amber-300/25 text-amber-50 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-slate-400 font-sans">{msg.time}</span>
                        {msg.sender === 'clint' && msg.mood && (
                          <span className="text-[10px] text-amber-300/70 font-sans italic">
                            &bull; {msg.mood === 'loving' ? 'malambing' : msg.mood === 'laugh' ? 'natatawa' : msg.mood === 'angry' ? 'nag-tampo 😤' : 'masaya'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isAiGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 text-xs text-amber-200/90 font-serif italic bg-slate-900/80 border border-amber-300/20 px-4 py-2.5 rounded-2xl w-fit"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Nag-iisip si Clint ng sagot para sa'yo, Lovey... ✨</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Topics Pill Bar */}
                <div className="px-4 py-2 bg-black/40 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-amber-300/60 shrink-0 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Paboritong Topics:
                    </span>
                    {QUICK_TOPICS.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(topic.text)}
                        disabled={isAiGenerating}
                        className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-300/40 text-xs text-amber-200/90 hover:text-amber-100 transition-all font-serif disabled:opacity-40 flex items-center gap-1"
                      >
                        <span>{topic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/80 shrink-0 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="I-type ang mensahe mo kay Clint (e.g. Kumusta ka na diyan?)..."
                    disabled={isAiGenerating}
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition-all font-serif"
                  />

                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="I-reset ang usapan"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-slate-200 border border-white/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAiGenerating}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-300 to-amber-300 hover:from-amber-300 hover:to-rose-200 disabled:opacity-40 text-slate-950 font-serif font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(244,213,141,0.4)] transition-all cursor-pointer"
                  >
                    <span>Ipadala</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Memory Bank & Inside Jokes View */}
            {activeTab === 'memories' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-amber-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-300" />
                      Memory &amp; Personality Bank ni Clint
                    </h4>
                    <p className="text-xs text-amber-200/70 font-serif">
                      Lahat ng inside jokes, espesyal na petsa, at alaala na palaging naaalala ng AI ni Clint sa bawat usapan.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('addJoke')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans text-xs font-semibold flex items-center gap-1 transition-all shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Magdagdag ng Joke / Note</span>
                  </button>
                </div>

                {/* 1. Inside Jokes List */}
                <div>
                  <h5 className="text-xs uppercase font-sans font-semibold tracking-wider text-amber-300/80 mb-2.5 flex items-center gap-1.5">
                    <Laugh className="w-3.5 h-3.5 text-amber-400" />
                    Mga Inside Jokes &amp; Lambingan ({personalityContext.insideJokes.length})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {personalityContext.insideJokes.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendMessage(`Naalala mo ba: "${item.joke}"?`);
                        }}
                        className="group p-3.5 rounded-2xl bg-white/[0.04] hover:bg-amber-400/10 border border-white/10 hover:border-amber-300/40 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-base">{item.emoji || '✨'}</span>
                            <span className="text-xs font-serif font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                              "{item.joke}"
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300/90 font-serif leading-relaxed pl-6">
                            {item.meaning}
                          </p>
                        </div>
                        <span className="mt-2 text-[10px] text-amber-300/60 font-sans pl-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          I-click para pag-usapan &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Special Dates */}
                <div>
                  <h5 className="text-xs uppercase font-sans font-semibold tracking-wider text-amber-300/80 mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    Mahahalagang Petsa at Milestones
                  </h5>
                  <div className="space-y-2">
                    {personalityContext.specialDates.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-base shrink-0">
                          {d.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h6 className="text-xs font-serif font-bold text-amber-100">{d.title}</h6>
                            <span className="text-[10px] text-rose-300/90 font-sans font-medium px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                              {d.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-serif leading-relaxed mt-1">
                            {d.story}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Conversational Style & Catchphrases */}
                <div>
                  <h5 className="text-xs uppercase font-sans font-semibold tracking-wider text-amber-300/80 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Paboritong Linya at Quirks ni Clint
                  </h5>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs font-serif">
                    <div className="flex items-center gap-2 text-amber-200">
                      <span className="font-sans font-semibold">Tawag kay Maica:</span>
                      <span className="italic">{personalityContext.userNicknames.join(', ')}</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="font-sans font-semibold text-amber-200">Paboritong Catchphrases:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                        {personalityContext.conversationalStyle.catchphrases.map((c, idx) => (
                          <li key={idx} className="italic">"{c}"</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Custom Inside Joke / Memory Form */}
            {activeTab === 'addJoke' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-sm font-serif font-bold text-amber-100 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    Magdagdag ng Inside Joke o Alaala
                  </h4>
                  <button
                    onClick={() => setActiveTab('memories')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Bumalik
                  </button>
                </div>

                {newJokeAddedSuccess ? (
                  <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-center flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                    <h5 className="text-sm font-serif font-bold text-emerald-200">
                      Matagumpay na Naidagdag! 🎉
                    </h5>
                    <p className="text-xs text-slate-300 font-serif">
                      Tandaan na ito ni Clint sa lahat ng susunod ninyong usapan.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddNewJoke} className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-amber-200 mb-1.5">
                        Linya o Joke (e.g. "Yung biglang umulan sa motor")
                      </label>
                      <input
                        type="text"
                        value={newJokeTitle}
                        onChange={(e) => setNewJokeTitle(e.target.value)}
                        placeholder="Ilagay ang pamagat o linya..."
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-amber-200 mb-1.5">
                        Kahulugan o Kwento sa Likod Nito
                      </label>
                      <textarea
                        value={newJokeMeaning}
                        onChange={(e) => setNewJokeMeaning(e.target.value)}
                        placeholder="Bakit ito espesyal o nakakatawa para sa inyo ni Clint?..."
                        required
                        rows={4}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3.5 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 font-serif leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('memories')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-serif text-slate-300 transition-colors"
                      >
                        Kanselahin
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-serif font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>I-save sa Memory Bank</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
