// Lucian UX/UI Prompt #215 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#215
"use client";

import { useState, useRef, useEffect } from "react";

const QUICK_QUESTIONS = [
  "Tra cứu Hộ chiếu số QR thế nào?",
  "Cách chọn Hộp quà đặc sản?",
  "Gặp chuyên viên tư vấn OCOP",
];

const QUICK_ANSWERS = [
  {
    text: "Mỗi sản phẩm OCOP đều được gắn mã QR Hộ chiếu số riêng. Quét mã bằng camera điện thoại để xem trực tiếp tọa độ vườn trồng, nhật ký thu hoạch và giấy chứng nhận OCOP 4 sao.",
    article: {
      title: "Cẩm nang Hộ chiếu số OCOP Đồng Nai",
      readTime: "2 phút đọc",
    },
  },
  {
    text: "Bạn có thể tự chọn tối đa 7 món đặc sản Đồng Nai (Bột ca cao, Cà phê Robusta, Bưởi Tân Triều, Hạt điều, Mật ong...) vào Hộp quà Tổ ong ở trang chủ để được đóng hộp và giao tận nơi.",
    article: {
      title: "Quy trình đóng gói & giao tận vườn",
      readTime: "1 phút đọc",
    },
  },
];

export default function SupportChatBubble() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      type: "bot",
      text: "Xin chào! Bạn muốn tìm hiểu gì về đặc sản OCOP Đồng Nai? 👋",
    },
  ]);
  const [usedChips, setUsedChips] = useState({});
  const [inputText, setInputText] = useState("");

  const rootRef = useRef(null);
  const launcherRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, busy]);

  // Esc key and click outside handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target) && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  };

  const handleChipClick = (index) => {
    if (busy || usedChips[index]) return;
    setBusy(true);
    setUsedChips((prev) => ({ ...prev, [index]: true }));

    const question = QUICK_QUESTIONS[index];
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + "-me", type: "me", text: question },
    ]);

    setTimeout(() => {
      if (index < 2) {
        const ans = QUICK_ANSWERS[index];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-ans",
            type: "bot",
            text: ans.text,
            article: ans.article,
          },
        ]);
        setBusy(false);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-sys",
            type: "system",
            text: "Chuyên viên Thảo Nguyên đã tham gia cuộc trò chuyện",
          },
        ]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + "-agent",
              type: "agent",
              text: "Dạ chào bạn, mình là Thảo Nguyên từ nhóm dự án OCOP Passport Đồng Nai. Bạn đang quan tâm đến sản phẩm nào để mình tư vấn chi tiết ạ?",
            },
          ]);
          setBusy(false);
        }, 700);
      }
    }, 1100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || busy) return;
    const userText = inputText.trim();
    setInputText("");
    setBusy(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + "-user", type: "me", text: userText },
    ]);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply =
        "Cảm ơn bạn đã quan tâm! Mọi sản phẩm OCOP đều có mã QR Hộ chiếu số minh bạch từ lô trồng. Bạn có thể chọn 'Gặp chuyên viên tư vấn OCOP' bên trên để được hỗ trợ thêm nhé!";

      if (lower.includes("giao") || lower.includes("ship") || lower.includes("vận chuyển")) {
        reply =
          "Đơn hàng được gửi trực tiếp từ Hợp tác xã Đồng Nai. Thời gian nhận hàng từ 1-2 ngày trong khu vực Đông Nam Bộ và 2-3 ngày toàn quốc.";
      } else if (lower.includes("giá") || lower.includes("bao nhiêu") || lower.includes("tiền")) {
        reply =
          "Giá sản phẩm dao động từ 95.000đ đến 285.000đ niêm yết trực tiếp từ nông hộ, được miễn phí vận chuyển cho đơn quà tặng combo!";
      } else if (lower.includes("ca cao") || lower.includes("cacao")) {
        reply =
          "Bột Ca cao nguyên chất Trọng Đức (Định Quán) đạt chuẩn OCOP 4 sao, lên men tự nhiên theo quy trình Nhật Bản, thơm đậm đà không phụ gia.";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-bot", type: "bot", text: reply },
      ]);
      setBusy(false);
    }, 900);
  };

  return (
    <div
      ref={rootRef}
      className={`ux u215-container ${open ? "is-open" : ""}`}
    >
      <style jsx>{`
        .u215-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 55;
          --ux-page: var(--bg, #F0F7FC);
          --ux-surface: var(--panel, #FFFFFF);
          --ux-surface-2: var(--blue-soft, #E6F5FD);
          --ux-surface-3: #E0F2FE;
          --ux-ink: var(--ink, #0F172A);
          --ux-ink-2: var(--ink-2, #334155);
          --ux-ink-3: var(--mute, #64748B);
          --ux-line: var(--line, #E2E8F0);
          --ux-line-2: var(--line-strong, #CBD5E1);
          --ux-accent: var(--blue, #0297DE);
          --ux-accent-2: var(--blue, #0284C7);
          --ux-accent-soft: rgba(2, 151, 222, 0.12);
          --ux-accent-ink: #FFFFFF;
          --ux-mint: var(--ok, #0D9488);
          --ux-warn: #D97706;
          --ux-danger: #EF4444;
          --ux-glass: rgba(255, 255, 255, 0.75);
          --ux-glass-line: rgba(255, 255, 255, 0.9);
          --ux-shadow: rgba(15, 23, 42, 0.14);
          --ux-shadow-strong: rgba(2, 120, 179, 0.28);
          --ux-grad: linear-gradient(135deg, #0297DE, #0284C7 55%, #0D9488);
        }

        @media (prefers-color-scheme: dark) {
          :global(:root:not([data-theme="light"])) .u215-container {
            --ux-page: #0B1120;
            --ux-surface: #1E293B;
            --ux-surface-2: #0F172A;
            --ux-surface-3: #334155;
            --ux-ink: #F8FAFC;
            --ux-ink-2: #CBD5E1;
            --ux-ink-3: #94A3B8;
            --ux-line: rgba(255, 255, 255, 0.1);
            --ux-line-2: rgba(255, 255, 255, 0.18);
            --ux-accent: #38BDF8;
            --ux-accent-2: #60A5FA;
            --ux-accent-soft: rgba(56, 189, 248, 0.15);
            --ux-accent-ink: #0F172A;
            --ux-mint: #34D399;
            --ux-warn: #FBBF24;
            --ux-danger: #F87171;
            --ux-shadow: rgba(0, 0, 0, 0.45);
            --ux-shadow-strong: rgba(0, 0, 0, 0.72);
            --ux-grad: linear-gradient(135deg, #38BDF8, #60A5FA 55%, #34D399);
          }
        }

        :global(:root[data-theme="dark"]) .u215-container {
          --ux-page: #0B1120;
          --ux-surface: #1E293B;
          --ux-surface-2: #0F172A;
          --ux-surface-3: #334155;
          --ux-ink: #F8FAFC;
          --ux-ink-2: #CBD5E1;
          --ux-ink-3: #94A3B8;
          --ux-line: rgba(255, 255, 255, 0.1);
          --ux-line-2: rgba(255, 255, 255, 0.18);
          --ux-accent: #38BDF8;
          --ux-accent-2: #60A5FA;
          --ux-accent-soft: rgba(56, 189, 248, 0.15);
          --ux-accent-ink: #0F172A;
          --ux-mint: #34D399;
          --ux-warn: #FBBF24;
          --ux-danger: #F87171;
          --ux-shadow: rgba(0, 0, 0, 0.45);
          --ux-shadow-strong: rgba(0, 0, 0, 0.72);
          --ux-grad: linear-gradient(135deg, #38BDF8, #60A5FA 55%, #34D399);
        }

        /* Launcher Floating Bubble */
        .u215-ln {
          position: relative;
          z-index: 3;
          width: 56px;
          height: 56px;
          border: 0;
          border-radius: 50%;
          background: var(--ux-accent);
          color: #fff;
          display: grid;
          place-items: center;
          padding: 0;
          cursor: pointer;
          box-shadow: 0 12px 28px -6px rgba(2, 132, 199, 0.45);
          transition: transform 0.3s cubic-bezier(0.3, 1.6, 0.5, 1);
        }

        .u215-ln svg {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 26px;
          height: 26px;
          transition: transform 0.35s cubic-bezier(0.3, 1.5, 0.5, 1), opacity 0.2s;
        }

        .u215-ln .x {
          transform: rotate(-90deg) scale(0.5);
          opacity: 0;
        }

        .is-open .u215-ln .c {
          transform: rotate(90deg) scale(0.5);
          opacity: 0;
        }

        .is-open .u215-ln .x {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }

        .u215-ln:hover {
          transform: scale(1.05);
        }

        .u215-ln:active {
          transform: scale(0.92);
        }

        /* Chat Widget Window */
        .u215-wg {
          position: absolute;
          right: 0;
          bottom: 68px;
          z-index: 2;
          width: 340px;
          height: 490px;
          max-width: calc(100vw - 32px);
          max-height: calc(100dvh - 100px);
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          background: var(--ux-surface);
          box-shadow: 0 0 0 1px var(--ux-line), 0 30px 60px -20px var(--ux-shadow-strong);
          overflow: hidden;
          transform-origin: calc(100% - 28px) calc(100% + 28px);
          transform: scale(0.1);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.45s cubic-bezier(0.3, 1.15, 0.4, 1), opacity 0.25s;
        }

        .is-open .u215-wg {
          transform: none;
          opacity: 1;
          pointer-events: auto;
        }

        /* Window Header */
        .u215-wh {
          padding: 16px 16px 14px;
          background: var(--ux-grad);
          color: #fff;
        }

        .u215-fs {
          display: flex;
        }

        .u215-fs i {
          width: 28px;
          height: 28px;
          margin-right: -8px;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
          display: grid;
          place-items: center;
          font-style: normal;
          font-size: 11px;
          font-weight: 850;
          color: #fff;
        }

        .u215-wh b {
          display: block;
          margin-top: 10px;
          font-size: 15.5px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .u215-wh small {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0.95;
        }

        .u215-wh small::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
          box-shadow: 0 0 8px #4ADE80;
        }

        /* Message Stream */
        .u215-ms {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          padding: 14px 12px 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .u215-ms::-webkit-scrollbar {
          display: none;
        }

        .u215-b {
          max-width: 84%;
          padding: 9px 12px;
          border-radius: 14px;
          font-size: 12.5px;
          line-height: 1.45;
          font-weight: 600;
          animation: u215-in 0.35s cubic-bezier(0.3, 1.4, 0.5, 1) backwards;
        }

        @keyframes u215-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
        }

        .u215-b.bt {
          align-self: flex-start;
          background: var(--ux-surface-2);
          color: var(--ux-ink);
          border-bottom-left-radius: 4px;
        }

        .u215-b.me {
          align-self: flex-end;
          background: var(--ux-accent);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .u215-b.ag {
          align-self: flex-start;
          background: #E0F2FE;
          color: var(--ux-ink);
          border-left: 3px solid var(--ux-accent);
          border-bottom-left-radius: 4px;
        }

        /* Typing Dots */
        .u215-ty {
          align-self: flex-start;
          display: flex;
          gap: 4px;
          padding: 10px 14px;
          border-radius: 14px;
          border-bottom-left-radius: 4px;
          background: var(--ux-surface-2);
        }

        .u215-ty i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--ux-accent);
          animation: u215-dt 1s ease-in-out infinite;
        }

        .u215-ty i:nth-child(2) {
          animation-delay: 0.15s;
        }
        .u215-ty i:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes u215-dt {
          30% {
            transform: translateY(-4px);
            opacity: 0.5;
          }
        }

        /* Article Card Attachment */
        .u215-ar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          background: var(--ux-surface);
          box-shadow: inset 0 0 0 1px var(--ux-line);
        }

        .u215-ar i {
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #38BDF8, #0284C7);
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 13px;
        }

        .u215-ar b {
          display: block;
          font-size: 11.5px;
          font-weight: 800;
          color: var(--ux-ink);
        }

        .u215-ar small {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--ux-ink-3);
        }

        /* System Announcement Line */
        .u215-sy {
          align-self: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--ux-surface-2);
          font-size: 10px;
          font-weight: 800;
          color: var(--ux-accent);
          animation: u215-in 0.35s backwards;
        }

        /* Quick Questions */
        .u215-qs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px 12px 10px;
          justify-content: flex-end;
        }

        .u215-qk {
          height: 28px;
          padding: 0 10px;
          border: 0;
          border-radius: 999px;
          background: var(--ux-surface);
          box-shadow: inset 0 0 0 1.5px rgba(2, 151, 222, 0.45);
          color: var(--ux-accent);
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s, background 0.15s;
        }

        .u215-qk:hover {
          background: var(--ux-surface-2);
        }

        .u215-qk:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* Input Bottom Bar */
        .u215-ip {
          display: flex;
          gap: 6px;
          padding: 8px 10px 10px;
          border-top: 1px solid var(--ux-line);
          background: var(--ux-surface);
        }

        .u215-ip input {
          flex: 1;
          min-width: 0;
          height: 36px;
          padding: 0 12px;
          border: 0;
          border-radius: 10px;
          background: var(--ux-surface-2);
          color: var(--ux-ink);
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          outline: none;
        }

        .u215-ip input:focus {
          box-shadow: inset 0 0 0 1.5px var(--ux-accent);
        }

        .u215-ip button {
          flex: none;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: var(--ux-accent);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .u215-ip button:disabled {
          opacity: 0.4;
          cursor: default;
        }

        /* Responsive on mobile where bottom nav is active */
        @media (max-width: 860px) {
          .u215-container {
            bottom: 74px;
            right: 16px;
          }
          .u215-wg {
            bottom: 64px;
            right: 0;
            width: calc(100vw - 32px);
            height: 430px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .u215-wg,
          .u215-ln svg,
          .u215-ln {
            transition: none !important;
          }
          .u215-b,
          .u215-sy,
          .u215-ty i {
            animation: none !important;
          }
        }
      `}</style>

      {/* Chat Window */}
      <div
        className="u215-wg"
        role="dialog"
        aria-hidden={!open}
        aria-label="Cửa sổ hỗ trợ OCOP"
      >
        <div className="u215-wh">
          <div className="u215-fs" aria-hidden="true">
            <i style={{ background: "#0284C7" }} title="Phương Thảo">T</i>
            <i style={{ background: "#38BDF8" }} title="Thảo Nguyên">N</i>
            <i style={{ background: "#0D9488" }} title="Kim Ngân">K</i>
          </div>
          <b>Trợ lý số OCOP Đồng Nai</b>
          <small>Thường phản hồi trong 1 phút</small>
        </div>

        <div className="u215-ms" aria-live="polite">
          {messages.map((m) => {
            if (m.type === "system") {
              return (
                <div key={m.id} className="u215-sy">
                  {m.text}
                </div>
              );
            }
            return (
              <div
                key={m.id}
                className={`u215-b ${m.type === "me" ? "me" : m.type === "agent" ? "ag" : "bt"}`}
              >
                {m.text}
                {m.article && (
                  <div className="u215-ar">
                    <i aria-hidden="true">📖</i>
                    <div>
                      <b>{m.article.title}</b>
                      <small>{m.article.readTime}</small>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {busy && (
            <div className="u215-ty" aria-label="Đang trả lời...">
              <i />
              <i />
              <i />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="u215-qs">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={q}
              type="button"
              className="u215-qk"
              disabled={busy || !!usedChips[i]}
              tabIndex={open ? 0 : -1}
              onClick={() => handleChipClick(i)}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="u215-ip">
          <input
            ref={inputRef}
            placeholder="Nhập câu hỏi cho trợ lý AI..."
            aria-label="Nhập tin nhắn"
            tabIndex={open ? 0 : -1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || busy}
            aria-label="Gửi tin nhắn"
            tabIndex={open ? 0 : -1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      {/* Floating Launcher Bubble */}
      <button
        ref={launcherRef}
        type="button"
        className="u215-ln"
        aria-label={open ? "Đóng chat hỗ trợ" : "Mở chat hỗ trợ OCOP"}
        aria-expanded={open}
        onClick={handleToggle}
      >
        <svg className="c" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 5.5h16v10.5H10l-5 3.5V16H4z"
            fill="currentColor"
          />
        </svg>
        <svg className="x" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
