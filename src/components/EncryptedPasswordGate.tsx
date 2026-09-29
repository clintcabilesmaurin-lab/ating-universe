import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Eye, EyeOff, Sparkles, Heart, AlertCircle } from 'lucide-react';
import { verifyUniversePassword, setUniverseUnlocked } from '../utils/security';
import { audioEngine } from '../utils/audioEngine';

interface EncryptedPasswordGateProps {
  onUnlockSuccess: () => void;
  triggerFloatingHearts: (count?: number) => void;
  floatingHearts: Array<{
    id: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    delay: number;
    duration: number;
    color: string;
    opacity: number;
  }>;
}

export const EncryptedPasswordGate: React.FC<EncryptedPasswordGateProps> = ({
  onUnlockSuccess,
  triggerFloatingHearts,
  floatingHearts,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying || isSuccess) return;

    const trimmed = password.trim();
    if (!trimmed) {
      setErrorMsg('Pakilagay ang password, Lovey 🥺');
      setShakeCount((prev) => prev + 1);
      audioEngine.playLockedSound();
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const { isValid } = await verifyUniversePassword(trimmed);

      if (isValid) {
        setIsSuccess(true);
        setUniverseUnlocked(true);
        audioEngine.unlock();
        audioEngine.play();
        audioEngine.playStarGazeChime();
        triggerFloatingHearts(20);

        // Smooth transition into universe after celebrating success
        setTimeout(() => {
          onUnlockSuccess();
        }, 1200);
      } else {
        audioEngine.playLockedSound();
        setShakeCount((prev) => prev + 1);
        setErrorMsg('Maling password, Lovey 🥺 Subukan muli!');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setErrorMsg('May naganap na error sa pag-verify. Subukan muli.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      id="encrypted-password-gate"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-y-auto"
    >
      {/* Background Starry Aura & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating Hearts Container */}
      <div className="absolute top-1/3 inset-x-0 flex justify-center pointer-events-none z-20">
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{
                opacity: heart.opacity,
                scale: 0.3,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [heart.opacity, heart.opacity * 0.9, 0],
                scale: [0.3, heart.scale, heart.scale * 1.3],
                x: heart.x,
                y: heart.y,
                rotate: heart.rotate,
              }}
              transition={{
                duration: heart.duration,
                delay: heart.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute"
            >
              <Heart
                className="w-5 h-5 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] fill-current"
                style={{ color: heart.color }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Central Gate Card */}
      <motion.div
        key={shakeCount}
        initial={shakeCount > 0 ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-amber-300/30 shadow-[0_0_50px_rgba(244,213,141,0.15)] backdrop-blur-2xl text-slate-100 flex flex-col items-center"
      >
        {/* Luminous Pulsing Orb with Lock Icon */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-radial from-amber-300/30 via-rose-500/20 to-transparent blur-md animate-pulse" />
          <motion.div
            animate={isSuccess ? { scale: [1, 1.25, 1], rotate: [0, 10, 0] } : {}}
            transition={{ duration: 0.6 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-colors duration-500 ${
              isSuccess
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30'
                : 'bg-amber-500/15 border-amber-300/40 text-amber-200 shadow-amber-400/20'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-7 h-7 text-emerald-300 animate-bounce" />
            ) : (
              <Lock className="w-7 h-7 text-amber-300" />
            )}
          </motion.div>
        </div>

        {/* Taglish Header */}
        <h1 className="text-xl sm:text-2xl font-serif text-amber-100 font-medium tracking-wide mb-1">
          {isSuccess ? 'Bukas Na ang Kalawakan! ✨' : 'Ano daw password?'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300/90 font-light mb-6 max-w-xs leading-relaxed">
          {isSuccess
            ? 'Access granted, my Lovey. Maligayang pagdating sa ating kalangitan.'
            : 'Ipasok ang ating lihim na password para mabuksan ang ating Universe 💖'}
        </p>

        {/* Password Form */}
        <form onSubmit={handleVerify} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-300/70">
              <KeyRound className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              disabled={isVerifying || isSuccess}
              placeholder="Ano daw password?"
              autoComplete="current-password"
              className={`w-full pl-10 pr-11 py-3 bg-slate-900/90 border rounded-2xl text-center font-mono text-sm tracking-widest placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none transition-all duration-300 ${
                errorMsg
                  ? 'border-rose-500/80 text-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30'
                  : isSuccess
                  ? 'border-emerald-400/80 text-emerald-200 bg-emerald-950/20'
                  : 'border-amber-300/40 text-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/30'
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-200 transition-colors"
              title={showPassword ? 'Itago ang password' : 'Ipakita ang password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 px-3"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 rounded-xl py-2 px-3 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                <span>Tama! Pumasok na tayo, Lovey... 💖</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit / Unlock Button */}
          <motion.button
            type="submit"
            disabled={isVerifying || isSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3.5 rounded-2xl font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 overflow-hidden relative ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-slate-950 shadow-emerald-400/40'
                : 'bg-gradient-to-r from-amber-300 via-rose-200 to-amber-300 text-slate-950 shadow-[0_0_30px_rgba(244,213,141,0.5)] hover:shadow-[0_0_40px_rgba(251,113,133,0.6)]'
            }`}
          >
            {/* Shimmer light sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />

            {isVerifying ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Chine-check ang password...</span>
              </>
            ) : isSuccess ? (
              <>
                <Unlock className="w-4 h-4 text-slate-950" />
                <span>Pumapasok na...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>I-unlock ang Universe ✨</span>
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};
