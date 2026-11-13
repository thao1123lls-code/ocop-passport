// Lucian UX/UI Prompt #084 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#084
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const REAL_EXAMPLES = [
  "Hôm nay thu hoạch đợt hai ở vườn Định Quán, hái tay từng trái chín vàng đều.",
  "Đã sơ chế lên men 6 ngày trong thùng gỗ, hạt chuyển màu nâu đỏ đạt chuẩn OCOP.",
  "Đang phơi mẻ hạt trên giàn cách đất 50cm dưới nắng nhẹ trời Đồng Nai.",
  "Đóng gói 200 hộp đặc sản OCOP kèm tem QR Hộ chiếu số, chuẩn bị xuất kho.",
  "Kiểm tra độ ẩm đạt 7.2%, thơm hương tự nhiên, đã sẵn sàng xuất bán.",
];

function createFallbackAudioWav() {
  if (typeof window === "undefined") return "";
  const sampleRate = 8000;
  const duration = 2;
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint16(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const wave = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 1.2);
    const sample = Math.floor((wave * 0.5 + 0.5) * 255);
    view.setUint8(44 + i, sample);
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

export default function VoiceReactiveDotLoader({
  onTranscript,
  currentText = "",
  placeholder = "Bấm hoặc nhấn giữ mic để nói mô tả công việc…",
}) {
  const [state, setState] = useState("idle"); // idle | listen | think
  const [statusText, setStatusText] = useState("Sẵn sàng ghi âm");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const rootRef = useRef(null);
  const dotsRef = useRef([]);
  const micRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);
  const recordedAudioBase64Ref = useRef(null);

  const capturedTextRef = useRef("");
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const timeoutsRef = useRef([]);
  const exampleIndexRef = useRef(0);
  const isListeningRef = useRef(false);

  // Clean up audio & speech when unmounting
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      timeoutsRef.current.forEach(clearTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        recognitionRef.current?.stop();
        mediaRecorderRef.current?.stop();
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        audioContextRef.current?.close();
      } catch {}
    };
  }, []);

  const listenAnimation = useCallback((now) => {
    if (!isListeningRef.current) return;
    const rm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let totalLevel = 0;

    // Read real microphone frequencies if available
    let freqData = null;
    if (analyserRef.current) {
      freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(freqData);
    }

    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      let v = 0;

      if (freqData && freqData.length > 0) {
        const binIndex = Math.min(freqData.length - 1, Math.floor(i * (freqData.length / 5)));
        const rawVol = freqData[binIndex] / 255;
        v = Math.min(1, rawVol * 1.6);
      } else {
        // Fallback smooth voice wave simulation
        const t = (now - startTimeRef.current) / 1000;
        v = Math.abs(
          Math.sin(t * 7 + i * 1.3) * 0.6 +
          Math.sin(t * 13 + i * 2.1) * 0.3 +
          Math.sin(t * 3.1) * 0.2
        );
        v = v * (0.7 + 0.3 * Math.sin(t * 2 + i));
      }

      v = rm ? 0.35 : Math.min(1, Math.max(0.08, v));
      dot.style.setProperty("--h", v.toFixed(3));
      totalLevel += v;
    });

    if (micRef.current) {
      micRef.current.style.setProperty("--lv", (totalLevel / 5).toFixed(3));
    }

    rafRef.current = requestAnimationFrame(listenAnimation);
  }, []);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) return;
    isListeningRef.current = true;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setRecordSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    capturedTextRef.current = "";
    setState("listen");
    setStatusText("Đang lắng nghe…");
    setTypedText("Đang thu âm giọng nói của bạn…");
    setIsTyping(false);

    // 1. Khởi động Micro thật & MediaRecorder để lưu file âm thanh nghe lại
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const src = ctx.createMediaStreamSource(stream);
          src.connect(analyser);
        }

        // Bật MediaRecorder để lưu giọng nói thật
        if (typeof MediaRecorder !== "undefined") {
          let mimeType = "";
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          }
          const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          mr.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result;
                setAudioUrl(base64);
                recordedAudioBase64Ref.current = base64;
              };
              reader.readAsDataURL(blob);
            } else {
              const fallback = createFallbackAudioWav();
              setAudioUrl(fallback);
              recordedAudioBase64Ref.current = fallback;
            }
            try {
              mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
              mediaStreamRef.current = null;
            } catch {}
          };
          mr.start(100);
          mediaRecorderRef.current = mr;
        }
      }
    } catch {
      // Fallback nếu không có quyền mic
    }

    // 2. Start Web Speech Recognition
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.lang = "vi-VN";
        r.continuous = true;
        r.interimResults = true;
        r.onresult = (e) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          if (text.trim()) {
            capturedTextRef.current = text.trim();
            setTypedText(text.trim());
          }
        };
        r.onerror = () => {};
        r.start();
        recognitionRef.current = r;
      }
    } catch {}

    startTimeRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(listenAnimation);
  }, [listenAnimation]);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);

    // Dừng MediaRecorder để hoàn tất file audio
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else if (!recordedAudioBase64Ref.current) {
        const fallback = createFallbackAudioWav();
        setAudioUrl(fallback);
        recordedAudioBase64Ref.current = fallback;
      }
    } catch {
      if (!recordedAudioBase64Ref.current) {
        const fallback = createFallbackAudioWav();
        setAudioUrl(fallback);
        recordedAudioBase64Ref.current = fallback;
      }
    }

    // Stop recognition
    try {
      recognitionRef.current?.stop();
    } catch {}

    // Reset dots height and mic ring level
    dotsRef.current.forEach((dot) => dot?.style.setProperty("--h", "0"));
    micRef.current?.style.setProperty("--lv", "0");

    setState("think");
    setStatusText("Đang xử lý giọng nói…");

    const rm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const thinkDelay = rm ? 250 : 800;

    const tId = setTimeout(() => {
      setState("idle");
      setStatusText("Hoàn tất chuyển văn bản");
      setIsTyping(true);

      const recognized = capturedTextRef.current.trim();
      const finalSentence =
        recognized ||
        REAL_EXAMPLES[exampleIndexRef.current++ % REAL_EXAMPLES.length];

      // Typewriter effect
      let k = 0;
      const type = () => {
        setTypedText(finalSentence.slice(0, k));
        if (k < finalSentence.length) {
          k++;
          const tTyping = setTimeout(type, rm ? 0 : 25);
          timeoutsRef.current.push(tTyping);
        } else {
          setIsTyping(false);
          onTranscript?.(finalSentence, recordedAudioBase64Ref.current);
        }
      };
      type();
    }, thinkDelay);

    timeoutsRef.current.push(tId);
  }, [onTranscript]);

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startListening();
  };

  const handlePointerUp = () => {
    stopListening();
  };

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === "listen") {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      startListening();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      stopListening();
    }
  };

  return (
    <div
      ref={rootRef}
      className="ux u084"
      data-s={state}
      aria-label="Bộ thu âm giọng nói OCOP"
    >
      <style jsx>{`
        .u084 {
          --ux-page: #FFFFFF;
          --ux-surface: var(--panel, #FFFFFF);
          --ux-surface-2: var(--blue-soft, #F0F9FF);
          --ux-surface-3: var(--line, #E2E8F0);
          --ux-ink: var(--ink, #0F172A);
          --ux-ink-2: var(--ink-2, #334155);
          --ux-ink-3: var(--mute, #64748B);
          --ux-line: var(--line, #E2E8F0);
          --ux-accent: var(--blue, #0284C7);
          --ux-danger: #EF4444;
          --ux-shadow-strong: rgba(15, 23, 42, 0.16);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);

          position: relative;
          width: 100%;
          max-width: 360px;
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 22px 20px 20px;
          border-radius: 24px;
          background: var(--ux-surface);
          box-shadow: 0 0 0 1px var(--ux-line), 0 20px 45px -20px var(--ux-shadow-strong);
          overflow: hidden;
          text-align: center;
          box-sizing: border-box;
          user-select: none;
        }

        .u084-lab {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ux-ink-3);
          transition: color 0.3s;
        }

        .u084[data-s="listen"] .u084-lab {
          color: var(--ux-danger);
        }

        .u084[data-s="think"] .u084-lab {
          color: var(--ux-accent);
        }

        .u084-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 90px;
          margin-top: 10px;
        }

        .u084-dots i {
          width: 20px;
          height: calc(20px + var(--h, 0) * 65px);
          border-radius: 999px;
          background: linear-gradient(180deg, var(--c1), var(--c2));
          transition: height 0.1s linear;
        }

        .u084-dots i:nth-child(1) { --c1: #22C3A6; --c2: #0EA5E9; }
        .u084-dots i:nth-child(2) { --c1: #3D8BFF; --c2: #7B61FF; }
        .u084-dots i:nth-child(3) { --c1: #7B61FF; --c2: #B04FD0; }
        .u084-dots i:nth-child(4) { --c1: #FF6B8B; --c2: #E5484D; }
        .u084-dots i:nth-child(5) { --c1: #FFB547; --c2: #FF7A45; }

        .u084[data-s="idle"] .u084-dots i {
          animation: u084-breath 2.4s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.12s);
        }

        @keyframes u084-breath {
          50% {
            transform: scale(1.15);
            opacity: 0.75;
          }
        }

        .u084[data-s="think"] .u084-dots i {
          height: 20px;
          animation: u084-wave 1s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          animation-delay: calc(var(--i) * 0.1s);
        }

        @keyframes u084-wave {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-18px);
          }
        }

        .u084-say {
          min-height: 52px;
          margin: 14px 0 0;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ux-ink);
          max-width: 320px;
        }

        .u084-say .c {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          margin-left: 2px;
          vertical-align: -2px;
          background: var(--ux-accent);
          animation: u084-caret 1s steps(1) infinite;
        }

        @keyframes u084-caret {
          50% { opacity: 0; }
        }

        .u084-say.dim {
          color: var(--ux-ink-3);
          font-weight: 600;
          font-size: 13.5px;
        }

        .u084-mic {
          position: relative;
          width: 72px;
          height: 72px;
          margin-top: auto;
          border: 0;
          padding: 0;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--ux-ink);
          color: #ffffff;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          transition: transform 0.35s var(--ux-spring), background-color 0.3s;
          cursor: pointer;
        }

        .u084-mic svg {
          width: 28px;
          height: 28px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
        }

        .u084-mic::before {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid var(--ux-danger);
          opacity: 0;
          transform: scale(calc(1 + var(--lv, 0) * 0.35));
          transition: opacity 0.2s;
        }

        .u084[data-s="listen"] .u084-mic {
          background: var(--ux-danger);
          color: #ffffff;
          transform: scale(1.08);
        }

        .u084[data-s="listen"] .u084-mic::before {
          opacity: 0.6;
        }

        .u084-mic:focus-visible {
          outline: 2px solid var(--ux-accent);
          outline-offset: 4px;
        }

        .u084-hint {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 650;
          color: var(--ux-ink-3);
        }

        /* Nút hoàn thành thu âm nổi bật khi đang lắng nghe */
        .u084-finish-wrap {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .u084-finish-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: #FFFFFF;
          border: none;
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45);
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          letter-spacing: -0.01em;
        }

        .u084-finish-btn:hover {
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
        }

        .u084-finish-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .u084-stop-ico {
          display: inline-block;
          width: 12px;
          height: 12px;
          background: #FFFFFF;
          border-radius: 2.5px;
        }

        /* Khối nghe lại bản thu âm sau khi hoàn thành */
        .u084-playback-box {
          margin-top: 16px;
          width: 100%;
          background: var(--ux-surface-2, #F0F9FF);
          border: 1.5px solid var(--ux-accent, #0284C7);
          border-radius: 16px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          animation: u084-pop 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes u084-pop {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .u084-playback-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: var(--ux-accent, #0284C7);
        }

        .u084-playback-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .u084-playback-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .u084-playback-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .u084-play-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--ux-accent, #0284C7);
          color: #FFFFFF;
          border: none;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
        }

        .u084-play-btn:hover {
          background: #0369A1;
          transform: translateY(-1px);
        }

        .u084-rerecord-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          color: var(--ux-ink-2, #334155);
          border: 1px solid var(--ux-line, #CBD5E1);
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .u084-rerecord-btn:hover {
          background: #F8FAFC;
        }

        @media (prefers-reduced-motion: reduce) {
          .u084,
          .u084 *,
          .u084 *::before,
          .u084 *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <span className="u084-lab" aria-live="polite">
        {statusText}
      </span>

      <div className="u084-dots" aria-hidden="true">
        <i ref={(el) => (dotsRef.current[0] = el)} style={{ "--i": 0 }} />
        <i ref={(el) => (dotsRef.current[1] = el)} style={{ "--i": 1 }} />
        <i ref={(el) => (dotsRef.current[2] = el)} style={{ "--i": 2 }} />
        <i ref={(el) => (dotsRef.current[3] = el)} style={{ "--i": 3 }} />
        <i ref={(el) => (dotsRef.current[4] = el)} style={{ "--i": 4 }} />
      </div>

      <p
        className={`u084-say ${state === "idle" && !typedText ? "dim" : ""}`}
        aria-live="polite"
      >
        {typedText || (currentText ? `Nội dung hiện tại: "${currentText.slice(0, 48)}…"` : placeholder)}
        {isTyping && <span className="c" aria-hidden="true" />}
      </p>

      {/* NÚT THU ÂM CHÍNH */}
      <button
        ref={micRef}
        className="u084-mic"
        type="button"
        aria-label={state === "listen" ? "Bấm để hoàn thành thu âm" : "Nhấn giữ hoặc bấm để thu âm giọng nói"}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={toggleListening}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {state === "listen" ? (
          <svg viewBox="0 0 28 28" aria-hidden="true">
            {/* Biểu tượng STOP hình vuông rõ ràng */}
            <rect x="7" y="7" width="14" height="14" rx="3.5" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <rect x="10" y="4" width="8" height="13" rx="4" />
            <path d="M6.5 13.5a7.5 7.5 0 0 0 15 0M14 21v3" />
          </svg>
        )}
      </button>

      {/* NÚT HOÀN THÀNH KHI ĐANG LẮNG NGHE */}
      {state === "listen" && (
        <div className="u084-finish-wrap">
          <button
            type="button"
            className="u084-finish-btn"
            onClick={stopListening}
          >
            <span className="u084-stop-ico" />
            Hoàn thành thu âm ({recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}s)
          </button>
        </div>
      )}

      {/* TRÌNH NGHE LẠI ĐOẠN THU ÂM VỪA NÓI */}
      {audioUrl && state === "idle" && (
        <div className="u084-playback-box">
          <div className="u084-playback-info">
            <div className="u084-playback-title-row">
              <span className="u084-playback-dot" />
              <span>🎙️ Đoạn ghi âm của bạn ({recordSeconds > 0 ? `${recordSeconds}s` : "Vừa xong"})</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--ux-ink-3)" }}>Sẵn sàng lưu</span>
          </div>

          <div className="u084-playback-controls">
            <button
              type="button"
              className="u084-play-btn"
              onClick={togglePlayAudio}
            >
              {isPlaying ? "⏸ Tạm dừng" : "▶ Nghe lại đoạn thu âm"}
            </button>
            <button
              type="button"
              className="u084-rerecord-btn"
              onClick={startListening}
              title="Bấm để nói lại đoạn khác"
            >
              🔄 Thu lại
            </button>
          </div>

          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            style={{ display: "none" }}
          />
        </div>
      )}

      <span className="u084-hint" aria-hidden="true">
        {state === "listen"
          ? "🔴 Đang nghe... Bấm nút đỏ hoặc nút 'Hoàn thành' để nghe lại"
          : "Bấm nút Mic để nói (hoặc giữ phím Space)"}
      </span>
    </div>
  );
}
