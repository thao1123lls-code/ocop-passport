// Bộ lọc cảnh báo cụm từ quảng cáo thổi phồng / tuyên bố y tế
const BAD = [/chữa (khỏi|bệnh)|điều trị|trị (bệnh|ung thư)|ngừa (ung thư|bệnh)|thần dược|\bcures?\b|treats? (cancer|disease)/i, /100%\s*(an toàn|tự nhiên)|số\s*1\b|tốt nhất|duy nhất|cam kết hiệu quả|hiệu quả ngay/i];
export const check = (t) => BAD.flatMap((r) => { const m = String(t).match(r); return m ? [m[0]] : []; });
