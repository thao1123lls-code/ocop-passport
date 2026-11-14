"use client";
import { useState, useEffect, useCallback } from "react";

export const DICT = {
  vi: {
    nav: {
      home: "Giới thiệu",
      diary: "Nhật ký số",
      ai: "Trợ lý AI",
      dashboard: "Bảng điều khiển",
      bag: "Giỏ hàng",
      langSwitchToast: "🇻🇳 Đã chuyển sang Tiếng Việt",
    },
    hero: {
      pill: "Gian hàng OCOP Đồng Nai · Minh bạch từng lô hàng",
      lines: [
        ["Đặc", "sản", "Đồng", "Nai", "chuẩn", "OCOP"],
        ["Đặt", "mua", "tận", "vườn"],
      ],
      lead: "Mỗi sản phẩm đều gắn một mã QR Hộ chiếu số riêng ghi lại hành trình thật từ vườn bằng ảnh và giọng nói của chính nông hộ, giúp bạn an tâm chọn mua đặc sản địa phương.",
      ctaShop: "Khám phá & Mua sắm ↓",
      ctaDiary: "Ghi nhật ký",
      replay: "Phát lại",
      metricOcop: "✓ Chuẩn OCOP",
      metricQr: "📱 QR Động",
      featuredBadge: "SẢN PHẨM NỔI BẬT",
      priceLabel: "Giá niêm yết:",
      hoverHint: "⟳ Rê chuột để dừng xoay thẻ",
      backBadge: "HỘ CHIẾU SỐ OCOP",
      backDesc: "Quét mã QR bằng điện thoại để kiểm tra chứng nhận OCOP và nguồn gốc từ nhà vườn Đồng Nai.",
      viewDetail: "Xem chi tiết hộ chiếu →",
    },
    divider: "Gian hàng Đặc sản OCOP Đồng Nai",
    store: {
      introBadge: "GIAN HÀNG NÔNG SẢN SỐ OCOP ĐỒNG NAI",
      introTitle: "Đặc sản OCOP Tỉnh Đồng Nai",
      introDesc: "Đặt mua nông sản trực tiếp từ nhà vườn & hợp tác xã · Quét mã QR Hộ chiếu số minh bạch từng công đoạn thu hoạch, sơ chế và đóng gói.",
      perk1: "100% Chuẩn OCOP",
      perk1Sub: "Thẩm định chất lượng",
      perk2: "Mã QR Động",
      perk2Sub: "Nhật ký số từ vườn",
      perk3: "Giao Tận Nơi",
      perk3Sub: "Bảo quản chuẩn tươi ngon",
      cats: ["Tất cả", "Ca cao & Cà phê", "Hạt & Trái cây", "Mật ong & Đặc sản"],
      searchPlaceholder: "Tìm ca cao, hạt điều, Định Quán…",
      openBag: "Mở giỏ hàng",
      addBag: "+ Thêm vào giỏ",
      added: "✓ Đã thêm",
      inBag: "Giỏ",
      qrBtn: "Hộ chiếu QR",
      detailBtn: "Chi tiết →",
      lot: "Lô",
      emptyStore: "Chưa có sản phẩm nào phù hợp với từ khóa",
      qrModalTitle: "Mã QR Hộ chiếu số Đồng Nai",
      qrModalDesc: "Quét bằng camera điện thoại để xem nguồn gốc minh bạch từ vườn",
      close: "Đóng",
    },
    trust: {
      badge: "Quảng bá & Minh bạch nguồn gốc",
      title: "Vì sao người mua tin chọn nông sản có Hộ chiếu số?",
      subDesc: "Mỗi sản phẩm OCOP Đồng Nai đều mang theo câu chuyện chân thật từ vùng trồng, được kiểm chứng bằng công nghệ số minh bạch.",
      col1Title: "Nhật ký thật bằng ảnh & giọng nói",
      col1Desc: "Nhật ký được chủ sở thiết bị thu thanh, ghi lại hành động của chính nông hộ tại vườn theo thời gian thực tại các vùng trồng Đồng Nai.",
      col2Title: "Quét QR xem trọn câu chuyện",
      col2Desc: "Thông tin từ lịch trình gieo trồng, quy trình chế biến, chứng nhận OCOP và hồ sơ nông dân được số hóa bằng tiếng Việt - Anh.",
      col3Title: "Đặt mua trực tiếp, nâng giá trị",
      col3Desc: "Người tiêu dùng kết nối trực tiếp với các đơn vị tại Đồng Nai, đóng góp vào chuyển dịch xanh, công bằng và tiêu dùng chất lượng.",
    },
    portal: {
      badge: "Dành cho HTX, Nông hộ & Đoàn thanh niên",
      title: "Công cụ số hóa & đưa sản phẩm lên sàn",
      diaryTitle: "Nhật ký số",
      diaryDesc: "Ghi lại hành trình bằng giọng nói & hình ảnh, hỗ trợ nhập liệu rảnh tay.",
      diaryAction: "Mở ứng dụng →",
      aiTitle: "Trợ lý bán hàng AI",
      aiDesc: "Tư vấn mô tả sản phẩm TMĐT, tạo bản tin trực tiếp từ cơ sở dữ liệu số.",
      aiAction: "Mở trợ lý →",
      dashTitle: "Bảng điều khiển",
      dashDesc: "Dành cho cơ sở, xã phường, xác minh hộ chiếu và theo dõi tiến độ số hóa.",
      dashAction: "Mở quản trị →",
      openTool: "Mở công cụ →",
    },
    footer: {
      copy: "OCOP Passport · Gian hàng & Hộ chiếu số nông sản Đồng Nai · Dự án “Vườn ươm ý tưởng số” 2026",
      authors: "Nhóm tác giả: Hoàng Phương Thảo, Trịnh Trần Thảo Nguyên, Bùi Kim Ngân · ĐH Công nghệ Đồng Nai",
    },
    cart: {
      title: "Giỏ hàng",
      freeShipNeed: "Mua thêm {amount} để được miễn phí vận chuyển",
      freeShipDone: "✓ Đơn hàng của bạn được MIỄN PHÍ vận chuyển toàn quốc!",
      emptyTitle: "Giỏ hàng của bạn đang trống",
      emptyDesc: "Hãy chọn các đặc sản Đồng Nai chuẩn OCOP để thêm vào giỏ nhé!",
      subtotal: "Tổng thanh toán",
      checkout: "Tiến hành đặt hàng →",
      orderSuccess: "Đặt hàng thành công!",
      orderSuccessDesc: "Đơn hàng của bạn đã được ghi nhận. Nhà vườn Đồng Nai sẽ liên hệ xác nhận sớm nhất.",
      orderCode: "Mã đơn hàng",
      formTitle: "Thông tin nhận hàng",
      name: "Họ và tên người nhận *",
      phone: "Số điện thoại liên hệ *",
      addr: "Địa chỉ giao hàng (Đồng Nai / toàn quốc) *",
      note: "Ghi chú giao hàng (tùy chọn)",
      confirmOrder: "Xác nhận đặt hàng",
      backToCart: "← Quay lại giỏ hàng",
      safeBadge: "Bảo mật & Không trừ trùng",
      close: "Đóng",
    },
  },
  en: {
    nav: {
      home: "Home",
      diary: "Digital Diary",
      ai: "AI Studio",
      dashboard: "Dashboard",
      bag: "Cart",
      langSwitchToast: "🇬🇧 Switched to English",
    },
    hero: {
      pill: "Dong Nai OCOP Showcase · Transparency in Every Batch",
      lines: [
        ["Dong", "Nai", "Certified", "OCOP", "Produce"],
        ["Order", "Direct", "From", "Orchards"],
      ],
      lead: "Each product carries an individual Digital Passport QR code recording real farming journeys with authentic photos and voice logs, ensuring trusted origin.",
      ctaShop: "Explore & Shop ↓",
      ctaDiary: "Digital Diary",
      replay: "Replay",
      metricOcop: "✓ OCOP Certified",
      metricQr: "📱 Dynamic QR",
      featuredBadge: "FEATURED PRODUCT",
      priceLabel: "Listed Price:",
      hoverHint: "⟳ Hover to pause rotation",
      backBadge: "DIGITAL OCOP PASSPORT",
      backDesc: "Scan QR code with your phone to verify OCOP certification and authentic origin from Dong Nai orchards.",
      viewDetail: "View Passport Details →",
    },
    divider: "Dong Nai OCOP Specialties Showcase",
    store: {
      introBadge: "DONG NAI DIGITAL OCOP SHOWCASE",
      introTitle: "Dong Nai OCOP Specialties",
      introDesc: "Order agri-produce directly from local orchards & cooperatives · Scan dynamic QR passport to inspect harvest, processing and packaging.",
      perk1: "100% OCOP Standard",
      perk1Sub: "Quality Assured",
      perk2: "Dynamic QR Code",
      perk2Sub: "Orchard Log Verified",
      perk3: "Direct Delivery",
      perk3Sub: "Guaranteed Freshness",
      cats: ["All", "Cacao & Coffee", "Nuts & Dried Fruits", "Honey & Specialties"],
      searchPlaceholder: "Search cacao, cashews, Dinh Quan…",
      openBag: "Open cart",
      addBag: "+ Add to Cart",
      added: "✓ Added",
      inBag: "Cart",
      qrBtn: "QR Passport",
      detailBtn: "Details →",
      lot: "Lot",
      emptyStore: "No products matched keyword",
      qrModalTitle: "Dong Nai Digital Passport QR",
      qrModalDesc: "Scan with your phone camera to inspect transparent orchard origin",
      close: "Close",
    },
    trust: {
      badge: "Promotion & Origin Transparency",
      title: "Why Customers Trust Agri-produce with Digital Passports?",
      subDesc: "Every Dong Nai OCOP product carries an authentic story verified by transparent digital technology.",
      col1Title: "Real Photos & Voice Records",
      col1Desc: "Diaries recorded with voice equipment, capturing authentic farmer actions on-site in real time across Dong Nai growing zones.",
      col2Title: "Scan QR to Unfold Story",
      col2Desc: "Information from planting schedules, processing methods, OCOP certification and farmer profiles digitized in Vietnamese - English.",
      col3Title: "Direct Purchase, Supporting Farmers",
      col3Desc: "Connecting consumers directly with Dong Nai local producers, contributing to green transition, fair trade, and quality consumption.",
    },
    portal: {
      badge: "For Cooperatives, Farmers & Youth Union",
      title: "Digitization Tools & E-Commerce Onboarding",
      diaryTitle: "Digital Diary",
      diaryDesc: "Record farming journeys via voice & photos with hands-free data entry.",
      diaryAction: "Open app →",
      aiTitle: "AI Sales Assistant",
      aiDesc: "Consult e-commerce descriptions and generate posts directly from digital database.",
      aiAction: "Open assistant →",
      dashTitle: "Management Dashboard",
      dashDesc: "For local communes and authorities: verify passports and track digitization progress.",
      dashAction: "Open dashboard →",
      openTool: "Open Tool →",
    },
    footer: {
      copy: "OCOP Passport · Dong Nai Agri-produce Digital Marketplace & Passport · Digital Incubator Project 2026",
      authors: "Authors: Hoang Phuong Thao, Trinh Tran Thao Nguyen, Bui Kim Ngan · Dong Nai University of Technology",
    },
    cart: {
      title: "Shopping Cart",
      freeShipNeed: "Add {amount} more for FREE shipping",
      freeShipDone: "✓ Your order qualifies for FREE nationwide shipping!",
      emptyTitle: "Your cart is empty",
      emptyDesc: "Select certified Dong Nai OCOP specialties to add to cart!",
      subtotal: "Subtotal",
      checkout: "Proceed to Checkout →",
      orderSuccess: "Order Placed Successfully!",
      orderSuccessDesc: "Your order has been recorded. Dong Nai growers will contact you shortly to confirm.",
      orderCode: "Order Code",
      formTitle: "Delivery Information",
      name: "Recipient Full Name *",
      phone: "Phone Number *",
      addr: "Delivery Address *",
      note: "Delivery Notes (optional)",
      confirmOrder: "Confirm Order",
      backToCart: "← Back to Cart",
      safeBadge: "Protected & Idempotent",
      close: "Close",
    },
  },
};

export function useLang() {
  const [lang, setLang] = useState("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ocop-lang") || "vi";
      setLang(saved);
    } catch {}

    const onLangChange = (e) => {
      if (e?.detail) setLang(e.detail);
    };

    window.addEventListener("ocop-lang-change", onLangChange);
    return () => window.removeEventListener("ocop-lang-change", onLangChange);
  }, []);

  const switchLang = useCallback((target) => {
    setLang(target);
    try {
      localStorage.setItem("ocop-lang", target);
      if (typeof document !== "undefined") {
        document.documentElement.lang = target;
      }
    } catch {}
    window.dispatchEvent(new CustomEvent("ocop-lang-change", { detail: target }));
  }, []);

  const t = DICT[lang] || DICT.vi;

  return { lang, switchLang, t };
}
