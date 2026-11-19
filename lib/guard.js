// Bộ lọc cảnh báo cụm từ quảng cáo thổi phồng / tuyên bố y tế quá đà
// Căn cứ theo Luật Quảng cáo 2012 & Nghị định 38/2021/NĐ-CP đối với nông sản & thực phẩm OCOP

const BAD_PATTERNS = [
  // 1. Tuyên bố chữa bệnh / y tế / thần dược
  {
    regex: /chữa (khỏi|bệnh|dứt điểm|hoàn toàn)|điều trị|trị (bệnh|ung thư|dứt điểm|khỏi)|ngừa (ung thư|bệnh)|thần dược|thuốc tiên|thần hiệu|cải lão hoàn đồng|chữa bách bệnh|trị tận gốc/gi,
    label: "Tuyên bố chữa bệnh / thần dược",
  },
  // 2. Từ ngữ tuyệt đối hóa / cam kết phi thực tế
  {
    regex: /100%\s*(khỏi|hết bệnh|chữa khỏi|an toàn tuyệt đối|tự nhiên tuyệt đối)|số\s*1\s*(việt nam|thế giới|thị trường)?|tốt nhất\s*(thị trường|việt nam)?|duy nhất\s*(có một không hai)?|cam kết (khỏi|hiệu quả|100%)|hiệu quả (ngay|tức thì|sau 1 ngày)|không bao giờ tái phát|vĩnh viễn không tái phát/gi,
    label: "Từ ngữ tuyệt đối / khẳng định quá đà",
  },
  // 3. Tiếng Anh cấm trong quảng cáo thực phẩm chức năng / nông sản
  {
    regex: /\b(cures?|treats?|miracle (drug|cure)|wonder drug|guaranteed cure|cure-all|100% cure)\b/gi,
    label: "Medical claim (English)",
  },
];

export const check = (text) => {
  if (!text) return [];
  const str = String(text);
  const found = new Set();
  
  for (const { regex } of BAD_PATTERNS) {
    // Reset lastIndex for global regex
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match[0]) {
        found.add(match[0].trim().toLowerCase());
      }
    }
  }
  
  return Array.from(found);
};
