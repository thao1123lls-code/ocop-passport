import { check } from "@/lib/guard";
const S = [["Gieo trồng", "sowing"], ["Chăm sóc", "care"], ["Thu hoạch", "harvest"], ["Sơ chế", "processing"], ["Đóng gói", "packing"], ["Xuất bán", "sale"]];
const SYS = `Bạn là trợ lý viết nội dung bán hàng cho nông sản OCOP Đồng Nai. CHỈ dùng dữ kiện có trong JSON được cung cấp. Tuyệt đối không thêm công dụng, chứng nhận, giải thưởng, số liệu không có trong dữ liệu. Không tuyên bố chữa bệnh, không dùng từ tuyệt đối ("tốt nhất", "số 1", "100% an toàn"). Trả về DUY NHẤT một JSON hợp lệ có 5 khóa chuỗi: desc (mô tả cho sàn TMĐT), post (bài đăng Facebook/Zalo/TikTok), live (kịch bản livestream 10 phút theo mốc phút), en (bản dịch tiếng Anh của desc), tags (hashtag, từ khóa và gợi ý khung giờ đăng).`;
const tpl = (p, f) => ({
  desc: `${p.name} từ ${p.farm || "vùng trồng Đồng Nai"}. Hành trình được ghi lại bằng nhật ký thật: ${f.join("; ")}. ${p.weight ? `Khối lượng ${p.weight}. ` : ""}Quét mã QR trên bao bì để xem hộ chiếu số.`,
  post: `Từ vườn đến tay bạn: ${p.name}\n${f.map((x) => "• " + x).join("\n")}\nQuét mã QR trên bao bì để xem hộ chiếu số của sản phẩm.`,
  live: `Phút 0-1: Chào khách, giới thiệu cơ sở và vùng trồng.\nPhút 1-3: Kể hành trình thật: ${f.join("; ")}. Mời khách quét mã QR.\nPhút 3-6: Điểm nổi bật, cách dùng, cách bảo quản${p.storage ? ` (${p.storage})` : ""}; trả lời câu hỏi.\nPhút 6-8: Ưu đãi, combo quà tặng, cách đặt hàng.\nPhút 8-10: Nhắc lại điểm nổi bật, kêu gọi đặt hàng, cảm ơn và hẹn buổi sau.`,
  en: `${p.name}, from Dong Nai, Vietnam. Documented journey: ${[...new Set(p.entries.map((e) => S[e.stage][1]))].join(", ")}. Scan the QR code on the pack to see the full story.`,
  tags: `#OCOP #DongNai #NongSanViet #TruyXuatNguonGoc\nGợi ý giờ đăng: 11:30-12:30 hoặc 19:30-21:30.`,
});
export async function POST(req) {
  let p; try { p = (await req.json()).product; } catch {}
  if (!p?.entries?.length) return Response.json({ error: "Chưa có nhật ký để soạn nội dung." }, { status: 400 });
  p.entries = p.entries.filter((e) => S[e.stage]).slice(0, 60).map((e) => ({ ...e, text: String(e.text).slice(0, 500) }));
  const f = [...p.entries].sort((a, b) => a.stage - b.stage || a.ts - b.ts).map((e) => `${S[e.stage][0]}: ${e.text.replace(/\.$/, "")}`);
  const t = tpl(p, f); let out = null, source = "template"; const key = process.env.ANTHROPIC_API_KEY;
  if (key) try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, signal: AbortSignal.timeout(25000),
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 1800, system: SYS, messages: [{ role: "user", content: JSON.stringify({ ten: p.name, co_so: p.farm, khoi_luong: p.weight, thanh_phan: p.ingredients, han_dung: p.expiry, bao_quan: p.storage, chung_nhan: p.certs, cau_chuyen: p.story, nhat_ky: f }) }] }) });
    const j = await r.json(), x = j.content?.[0]?.text || ""; out = JSON.parse(x.slice(x.indexOf("{"), x.lastIndexOf("}") + 1)); source = "ai";
  } catch {}
  const o = {}; for (const k of ["desc", "post", "live", "en", "tags"]) o[k] = String(out?.[k] || t[k]);
  return Response.json({ ...o, source, warnings: check(Object.values(o).join(" ")) });
}
