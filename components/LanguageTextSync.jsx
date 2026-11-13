"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DICT, useLang } from "@/lib/i18n";

const PAGE_EN = {
  "Đang tải…": "Loading…",
  "Nhật ký sản xuất OCOP": "OCOP Production Diary",
  "Hệ thống chưa có sản phẩm nào. Hãy tạo sản phẩm OCOP đầu tiên để bắt đầu ghi nhật ký và tạo hộ chiếu số.": "There are no products yet. Create your first OCOP product to start a production diary and digital passport.",
  "Quay lại trang chính": "Back to home",
  "Tạo sản phẩm OCOP đầu tiên": "Create your first OCOP product",
  "Nhập tên sản phẩm và kéo thanh trượt để chọn giá bán (VND). Hệ thống sẽ tự động tạo mã QR riêng, thẻ sản phẩm và hộ chiếu số.": "Enter a product name and choose a price (VND). The system will create a unique QR code, product card, and digital passport.",
  "Nhập tên sản phẩm OCOP...": "Enter an OCOP product name...",
  "Tạo sản phẩm": "Create product",
  "Nhật ký số sản xuất": "Digital Production Diary",
  "Chọn mốc, chụp ảnh thật và nói vài câu tiếng Việt. Hệ thống tự gắn giờ và vị trí GPS.": "Choose a stage, take a real photo, and describe the work. The system adds the time and GPS location.",
  "Xem hộ chiếu & QR →": "View passport & QR →",
  "Đang ngoại tuyến: dữ liệu vẫn được lưu trên điện thoại.": "Offline: your data is still saved on this device.",
  "Chọn sản phẩm đang ghi nhật ký": "Select a product for its diary",
  "Tìm sản phẩm theo tên hoặc mã lô...": "Search products by name or lot number...",
  "Tìm sản phẩm trong danh sách": "Search products",
  "Tìm sản phẩm": "Search products",
  "Tìm kiếm": "Search",
  "Thêm sản phẩm OCOP mới": "Add a new OCOP product",
  "Tên sản phẩm mới": "New product name",
  "Nhập tên sản phẩm mới (ví dụ: Bưởi da xanh Tân Triều)…": "Enter a new product name (e.g. Tan Trieu pomelo)…",
  "Thêm sản phẩm": "Add product",
  "Ghi mốc sản xuất mới": "Record a new production stage",
  "1. Chọn công đoạn": "1. Select a stage",
  "2. Nói hoặc gõ mô tả công việc": "2. Describe the work by voice or text",
  "Thu gọn bộ thu âm": "Hide voice recorder",
  "Mở bộ thu âm giọng nói OCOP": "Open voice recorder",
  "Ví dụ: Hôm nay thu hoạch đợt hai ở vườn ông Tư, hái tay, phơi ba ngày…": "Example: Today we hand-picked the second harvest at Mr. Tu's orchard and dried it for three days…",
  "File ghi âm giọng nói thật của nông hộ": "Farmer voice recording",
  "Đã sẵn sàng lưu kèm mốc nhật ký này để khách hàng quét QR nghe lại": "Ready to save with this diary entry for customers to hear through the QR code",
  "Xóa đoạn ghi âm này": "Remove this recording",
  "✕ Bỏ file": "✕ Remove file",
  "3. Ảnh thực tế tại vườn / xưởng": "3. Photo from the farm / workshop",
  "Xem trước": "Preview",
  "Tôi nhập hộ (tình nguyện viên Đoàn đồng hành số)": "I am entering this on the farmer's behalf (Digital Companion volunteer)",
  "Lưu vào nhật ký": "Save to diary",
  "Dòng thời gian (": "Timeline (",
  "Chỉ thêm, không sửa": "Append only; entries cannot be edited",
  "Lịch sử nhật ký được khóa sửa đổi để đảm bảo minh bạch nguồn gốc.": "Diary history is locked to keep product origins transparent.",
  " · có GPS": " · GPS location",
  " · Đoàn viên nhập hộ": " · Entered by a volunteer",
  "🎙️ Nghe giọng nói nông hộ tại vườn:": "🎙️ Hear the farmer's voice from the farm:",
  "Mã QR riêng của sản phẩm": "Product QR code",
  "Tự động tạo riêng cho ": "Created for ",
  ". Quét mã để xem trực tiếp nhật ký sản xuất.": ". Scan to view the production diary.",
  "Mở hộ chiếu số": "Open digital passport",
  "Soạn bài AI": "Create AI content",
  "Hồ sơ chi tiết sản phẩm": "Product details",
  "(hiển thị trên gian hàng & Hộ chiếu số)": "(shown in the store and digital passport)",
  "Giá bán niêm yết": "Listed price",
  "Cơ sở / hợp tác xã": "Farm / cooperative",
  "Mã lô": "Lot number",
  "Khối lượng": "Net weight",
  "Thành phần": "Ingredients",
  "Hạn sử dụng": "Expiry date",
  "Bảo quản": "Storage instructions",
  "Chứng nhận (cách nhau dấu phẩy)": "Certifications (comma-separated)",
  "Link gian hàng (https://…)": "Store link (https://…)",
  "Câu chuyện người làm ra sản phẩm": "The maker's story",
  "Trợ lý bán hàng & Tiếp thị số": "AI Sales & Digital Marketing Assistant",
  "Hệ thống chưa có sản phẩm nào. Hãy tạo sản phẩm tại Nhật ký số trước để AI có dữ liệu tạo nội dung tiếp thị.": "There are no products yet. Add a product in the Digital Diary first so AI can use its data to create marketing content.",
  "Tạo sản phẩm tại Nhật ký": "Add a product in the Diary",
  "Trợ lý bán hàng AI": "AI Sales Assistant",
  "Chỉ viết dựa trên dữ liệu thật trong nhật ký. Mọi nội dung ở trạng thái bản nháp chờ chủ cơ sở duyệt.": "Content is based on real diary data. Drafts must be approved by the producer.",
  "Chọn sản phẩm để soạn nội dung": "Select a product to create content",
  "Soạn từ nhật ký…": "Creating from diary…",
  "Soạn nội dung từ nhật ký": "Create content from diary",
  "Cần ít nhất một mốc nhật ký.": "At least one diary entry is required.",
  "Sẵn sàng sinh mô tả, bài đăng, kịch bản livestream & bản tiếng Anh.": "Ready to create a description, social posts, a livestream script, and an English version.",
  "Bản nháp · Chờ chủ cơ sở duyệt": "Draft · Awaiting producer approval",
  "✓ Đã duyệt": "✓ Approved",
  "Soạn bằng AI": "Created with AI",
  "Đã lưu chính thức": "Saved",
  "Duyệt nội dung": "Approve content",
  "Sao chép tất cả": "Copy all",
  "Cảnh báo cụm từ có thể vi phạm quy định quảng cáo: ": "Warning: this phrase may violate advertising rules: ",
  ". Hãy chỉnh sửa trước khi duyệt.": ". Edit it before approval.",
  "Bấm “Duyệt nội dung” ở trên để xác nhận và mở khóa nút Sao chép.": "Select “Approve content” above to confirm and enable copying.",
  "Bảng điều khiển quản lý": "Management Dashboard",
  "Theo dõi mức độ số hóa, xác minh hộ chiếu trước khi hiển thị công khai và phát hiện cơ sở cần hỗ trợ.": "Track digitization, verify passports before publishing, and find producers who need support.",
  "Xuất dữ liệu (JSON)": "Export data (JSON)",
  "Tạo sản phẩm mới": "Add product",
  "Đổi mật khẩu": "Change password",
  "Khóa & Đăng xuất": "Lock & sign out",
  "Cơ sở / HTX tham gia": "Participating farms / cooperatives",
  "+12% so với tháng trước": "+12% from last month",
  "Sản phẩm có hộ chiếu": "Products with passports",
  "Đã phủ rộng các xã, phường Đồng Nai": "Across Dong Nai's communes and wards",
  "Tổng mốc nhật ký": "Total diary entries",
  "Hộ chiếu đã xác minh": "Verified passports",
  "Mức độ hoàn thiện hồ sơ số": "Digital profile completion",
  "Nhật ký từ 3 mốc": "At least 3 diary entries",
  "Có ảnh thực tế": "Has real photos",
  "Đã xác minh OCOP": "OCOP verified",
  "Nội dung AI đã duyệt": "AI content approved",
  "Có link sàn TMĐT": "Has marketplace link",
  "Mẹo quản lý:": "Management tip:",
  "Các sản phẩm có mức độ hoàn thiện dưới 50% hoặc thiếu ảnh thực địa sẽ được ưu tiên hiển thị để Đoàn viên hỗ trợ nhập liệu.": "Products below 50% completion or missing field photos are prioritized for volunteer data-entry support.",
  "Xác minh hộ chiếu & Hỗ trợ cơ sở": "Passport verification & producer support",
  "Tìm tên, cơ sở...": "Search name or producer...",
  "Không tìm thấy sản phẩm nào phù hợp.": "No matching products found.",
  "Đã xác minh": "Verified",
  "Chờ xác minh": "Awaiting verification",
  "Chưa cập nhật cơ sở": "Producer not provided",
  "Cập nhật ": "Updated ",
  "Chưa có nhật ký": "No diary entries",
  "Giá:": "Price:",
  "Lưu": "Save",
  "Bấm để sửa giá sản phẩm này": "Edit this product's price",
  "🏷️ Giá: ": "🏷️ Price: ",
  "[Sửa]": "[Edit]",
  "Cần hỗ trợ:": "Needs support:",
  "Hồ sơ đầy đủ": "Profile complete",
  "Xem hộ chiếu": "View passport",
  "Bỏ xác minh": "Revoke verification",
  "Xác minh ngay": "Verify now",
  "Bạn có chắc muốn xóa vĩnh viễn sản phẩm \"": "Are you sure you want to permanently delete product \"",
  "\" không?": "\"?",
  "Xóa sản phẩm \"": "Delete product \"",
  "\"": "\"",
  "Hiển thị ": "Showing ",
  " sản phẩm OCOP": " OCOP products",
  "Đổi mật khẩu Quản trị": "Change admin password",
  "Đóng": "Close",
  "Mật khẩu hiện tại": "Current password",
  "Nhập mật khẩu hiện tại (mặc định: ocop2026)…": "Enter current password (default: ocop2026)…",
  "Mật khẩu mới": "New password",
  "Nhập mật khẩu mới (tối thiểu 4 ký tự)…": "Enter a new password (at least 4 characters)…",
  "Mật khẩu chưa đúng. Vui lòng thử lại.": "Incorrect password. Please try again.",
  "Ghi nhớ đăng nhập trên thiết bị này": "Remember me on this device",
  "Mật khẩu quản trị": "Admin password",
  "Nhập mật khẩu…": "Enter password…",
  "Ẩn mật khẩu": "Hide password",
  "Hiện mật khẩu": "Show password",
  "Mở bảng điều khiển →": "Open dashboard →",
  "Cổng quản trị riêng": "Private admin portal",
  "Xác thực hệ thống OCOP": "OCOP system authentication",
  "Đăng nhập Bảng điều khiển": "Sign in to dashboard",
  "Dành cho Đoàn xã, phường & Đơn vị quản lý OCOP xác minh và quản lý dữ liệu số hóa nông sản.": "For local youth unions and OCOP administrators to verify passports and manage digitized product data.",
  "Ghi chú mật khẩu:": "Password hint:",
  "Bấm để điền nhanh": "Click to fill",
  "Tải file JSON sao lưu toàn bộ dữ liệu": "Download a full JSON backup",
  "Đổi mật khẩu bảo vệ bảng điều khiển": "Change the dashboard password",
  "Khóa bảng điều khiển và đăng xuất": "Lock the dashboard and sign out",
  "Có ảnh thật": "Has photos",
  "Chưa cập nhật cơ sở": "Producer not provided",
  "Dữ liệu lưu trên thiết bị này": "Data saved on this device",
  "Tất cả": "All",
  "Đang nghe bạn nói... Bạn hãy nói một câu rồi dừng.": "Listening… Speak a sentence, then stop.",
  "Đã nhận diện giọng nói": "Voice recognized",
  "Không thể bật micro": "Unable to start the microphone",
  "Hôm nay thu hoạch đợt hai, trái chín vàng đều, phân loại và phơi giàn.": "Today we harvested the second crop, sorted the evenly ripened fruit, and dried it on racks.",
  "Nông hộ": "Farmer",
  "Công đoạn": "Production stage",
  "Gieo trồng": "Planting",
  "Chăm sóc": "Growing",
  "Thu hoạch": "Harvesting",
  "Sơ chế": "Processing",
  "Đóng gói": "Packaging",
  "Xuất bán": "Shipping",
  "Nhật ký": "Diary",
  "Giai đoạn ": "Stage ",
  "Tìm kiếm sản phẩm": "Search products",
  "Khối lượng": "Net weight",
  "Thành phần": "Ingredients",
  "Hạn sử dụng": "Expiry date",
  "Bảo quản": "Storage",
  "Chứng nhận": "Certification",
  "Câu chuyện người làm ra sản phẩm": "Producer story",
  "Sẵn sàng ghi âm": "Ready to record",
  "Đang lắng nghe…": "Listening…",
  "Đang xử lý giọng nói…": "Processing voice…",
  "Hoàn tất chuyển văn bản": "Transcription complete",
  "Bộ thu âm giọng nói OCOP": "OCOP voice recorder",
  "Bấm để hoàn thành thu âm": "Select to finish recording",
  "Nhấn giữ hoặc bấm để thu âm giọng nói": "Press and hold or select to record your voice",
  "Đoạn ghi âm của bạn (": "Your recording (",
  "Vừa xong": "Just now",
  "Sẵn sàng lưu": "Ready to save",
  "Bấm để nói lại đoạn khác": "Select to record another clip",
  "Xác nhận số điện thoại": "Confirm phone number",
  "Chọn quốc gia / Choose country": "Choose country",
  "Số điện thoại": "Phone number",
  "Tìm quốc gia...": "Search countries...",
  "Tìm quốc gia / Search countries": "Search countries",
  "Số điện thoại không hợp lệ": "Invalid phone number",
  "Xin chào! Bạn muốn tìm hiểu gì về đặc sản OCOP Đồng Nai? 👋": "Hello! What would you like to know about Dong Nai OCOP specialties? 👋",
  "Mỗi sản phẩm OCOP đều được gắn mã QR Hộ chiếu số riêng. Quét mã bằng camera điện thoại để xem trực tiếp tọa độ vườn trồng, nhật ký thu hoạch và giấy chứng nhận OCOP 4 sao.": "Every OCOP product has a unique Digital Passport QR code. Scan it to view the orchard location, harvest diary, and 4-star OCOP certificate.",
  "Cẩm nang Hộ chiếu số OCOP Đồng Nai": "Dong Nai OCOP Digital Passport Guide",
  "2 phút đọc": "2 min read",
  "Bạn có thể tự chọn tối đa 7 món đặc sản Đồng Nai (Bột ca cao, Cà phê Robusta, Bưởi Tân Triều, Hạt điều, Mật ong...) vào Hộp quà Tổ ong ở trang chủ để được đóng hộp và giao tận nơi.": "Choose up to 7 Dong Nai specialties (cacao, Robusta coffee, Tan Trieu pomelo, cashews, honey, and more) for a gift box on the home page, with packing and delivery included.",
  "Quy trình đóng gói & giao tận vườn": "Packing and direct delivery",
  "1 phút đọc": "1 min read",
  "Chuyên viên Thảo Nguyên đã tham gia cuộc trò chuyện": "Advisor Thao Nguyen joined the chat",
  "Dạ chào bạn, mình là Thảo Nguyên từ nhóm dự án OCOP Passport Đồng Nai. Bạn đang quan tâm đến sản phẩm nào để mình tư vấn chi tiết ạ?": "Hello, I'm Thao Nguyen from the Dong Nai OCOP Passport team. Which product would you like to know more about?",
  "Cảm ơn bạn đã quan tâm! Mọi sản phẩm OCOP đều có mã QR Hộ chiếu số minh bạch từ lô trồng. Bạn có thể chọn 'Gặp chuyên viên tư vấn OCOP' bên trên để được hỗ trợ thêm nhé!": "Thanks for your interest! Every OCOP product has a Digital Passport QR code with transparent growing-batch details. Select 'Talk to an OCOP specialist' above for more help.",
  "Đơn hàng được gửi trực tiếp từ Hợp tác xã Đồng Nai. Thời gian nhận hàng từ 1-2 ngày trong khu vực Đông Nam Bộ và 2-3 ngày toàn quốc.": "Orders ship directly from Dong Nai cooperatives. Delivery takes 1–2 days in Southeast Vietnam and 2–3 days nationwide.",
  "Giá sản phẩm dao động từ 95.000đ đến 285.000đ niêm yết trực tiếp từ nông hộ, được miễn phí vận chuyển cho đơn quà tặng combo!": "Prices range from VND 95,000 to 285,000, listed directly by growers. Gift combos include free shipping.",
  "Bột Ca cao nguyên chất Trọng Đức (Định Quán) đạt chuẩn OCOP 4 sao, lên men tự nhiên theo quy trình Nhật Bản, thơm đậm đà không phụ gia.": "Trong Duc pure cacao powder from Dinh Quan is 4-star OCOP certified, naturally fermented using a Japanese process, and contains no additives.",
  "LÔ ": "LOT ",
  "★ OCOP PASSPORT ĐỒNG NAI": "★ OCOP PASSPORT · DONG NAI",
  "QUÉT QR ĐỂ XEM HỘ CHIẾU & MUA": "SCAN QR TO VIEW PASSPORT & BUY",
  "Giao hàng tận nơi · Kiểm tra nguồn gốc": "Home delivery · Verified origin",
  "✓ ẢNH THẬT TẠI VƯỜN": "✓ REAL FARM PHOTO",
  "Cơ sở: ": "Producer: ",
  "Đồng Nai": "Dong Nai",
  "👉 BẤM ĐẶT HÀNG / QUÉT QR NGAY": "👉 ORDER NOW / SCAN QR",
  "AUTHENTIC SPECIALTY": "AUTHENTIC SPECIALTY",
  "CHỈ CÓ TẠI VƯỜN ĐỒNG NAI": "ONLY FROM DONG NAI FARMS",
  "NHẬT KÝ TẬN VƯỜN": "REAL FARM DIARY",
  "Thu hoạch tại vườn": "Harvested at the farm",
  "Từng trái chín được hái tay, ghi nhật ký bằng giọng nói và GPS tại vườn.": "Ripe fruit is hand-picked and recorded in the farm diary with voice notes and GPS.",
  "100% NGUYÊN CHẤT TỰ NHIÊN": "100% PURE & NATURAL",
  "QUY TRÌNH CHUẨN SẠCH": "CLEAN PRODUCTION PROCESS",
  "Chế biến sạch": "Clean processing",
  "Sơ chế & đóng gói đạt tiêu chuẩn an toàn thực phẩm.": "Processed and packaged to food-safety standards.",
  "AN TÂM CHO CẢ GIA ĐÌNH": "SAFE FOR THE WHOLE FAMILY",
  "ƯU ĐÃI ĐẶT HÀNG HÔM NAY": "TODAY'S OFFER",
  "ĐẶT MUA TẬN VƯỜN": "ORDER DIRECT FROM THE FARM",
  "Miễn phí giao hàng khi đặt qua gian hàng OCOP!": "Free delivery when you order from the OCOP store!",
  "QUÉT QR LÔ ": "SCAN LOT QR ",
  " ĐỂ MUA NGAY": " TO ORDER NOW",
  "Giá cũ: ": "Was: ",
  " · Giảm ngay trong hôm nay!": " · Special offer today!",
  "4 cảnh video quảng cáo (8 giây)": "4 ad scenes (8 seconds)",
  "CẢNH ": "SCENE ",
  "Tạo video quảng cáo ngay": "Create ad video",
  "AI dựng video TikTok / Reels / Shopee Video hoàn chỉnh có mã QR và giá bán.": "Create a complete TikTok, Reels, or Shopee video with a QR code and price.",
  "Chọn ngôn ngữ / Select language": "Select language",
  "Chuyển sang tiếng Việt": "Switch to Vietnamese",
  "Sản phẩm OCOP": "OCOP products",
  "Mật ong & Đặc sản": "Honey & Specialties",
  "Ca cao & Cà phê": "Cacao & Coffee",
  "Hạt & Trái cây": "Nuts & Fruit",
  "Trình duyệt chưa hỗ trợ micro tự động. Đã điền câu mẫu nhật ký chuẩn cho bạn.": "This browser does not support automatic speech recognition. A sample diary entry has been added.",
  "Đã nhận giọng nói:": "Voice recognized:",
  "Bạn có thể bấm Lưu.": "You can select Save.",
  "Chưa thu được âm thanh (": "No audio was captured (",
  "). Đã điền câu mẫu canh tác thực tế.": "). A sample farming entry has been added.",
  "Hãy nói hoặc gõ vài câu trước khi lưu.": "Speak or type a few sentences before saving.",
  "Đã lưu mốc “": "Saved the “",
  "”": "”",
  " kèm giọng nói": " with voice recording",
  " kèm vị trí": " with location",
  " (ngoại tuyến, lưu trên máy)": " (offline, saved on this device)",
  "Đang nghe bạn nói... Bạn hãy nói một câu rồi dừng.": "Listening… Speak a sentence, then stop.",
  "Lịch sử nhật ký được khóa sửa đổi để đảm bảo minh bạch nguồn gốc.": "Diary history is locked to keep product origins transparent.",
  "Giai đoạn ": "Stage ",
  "Mỗi sản phẩm ~": "About ",
  " mốc": " entries per product",
  "Báo cáo: ": "Report: ",
  "Hoàn tất": "Complete",
  "Xác thực hệ thống OCOP": "OCOP system authentication",
  "Đang tải…": "Loading…",
  "Mật khẩu hiện tại không đúng.": "The current password is incorrect.",
  "Mật khẩu mới phải từ 4 ký tự trở lên.": "The new password must contain at least 4 characters.",
  "✓ Đã cập nhật mật khẩu quản trị mới thành công!": "✓ Admin password updated successfully.",
  "Lỗi lưu trữ cục bộ.": "Local storage error.",
  "Bấm để điền nhanh": "Click to fill",
  "Không có sản phẩm nào": "No products found",
  "Cần hỗ trợ: ít mốc nhật ký": "Needs support: too few diary entries",
  "Cần hỗ trợ: thiếu ảnh thực tế": "Needs support: missing field photos",
  "Cần hỗ trợ: thiếu câu chuyện": "Needs support: missing producer story",
  "Cần hỗ trợ: chưa có link bán": "Needs support: missing sales link",
  "Cần hỗ trợ: lâu chưa cập nhật": "Needs support: diary needs an update",
  "Lô ": "Lot ",
  "Đang xử lý đơn hàng…": "Processing order…",
  "Thường phản hồi trong 1 phút": "Usually replies within 1 minute",
  "Trợ lý số OCOP Đồng Nai": "Dong Nai OCOP Assistant",
  "Nhập câu hỏi cho trợ lý AI...": "Ask the AI assistant...",
  "Nhập tin nhắn": "Enter a message",
  "Gửi tin nhắn": "Send message",
  "Đóng chat hỗ trợ": "Close support chat",
  "Mở chat hỗ trợ OCOP": "Open OCOP support chat",
  "Cửa sổ hỗ trợ OCOP": "OCOP support window",
  "Tra cứu Hộ chiếu số QR thế nào?": "How do I look up a QR Digital Passport?",
  "Cách chọn Hộp quà đặc sản?": "How do I choose a specialty gift box?",
  "Gặp chuyên viên tư vấn OCOP": "Talk to an OCOP specialist",
  "Đang trả lời...": "Replying...",
  "Cuộn lên đầu trang": "Back to top",
  "Tạo video quảng cáo chốt đơn cho nông dân": "Create sales videos for farmers",
  "AI Dựng Video Quảng Cáo Bán Hàng (9:16)": "AI Sales Video Maker (9:16)",
  "1. Chọn phong cách video quảng cáo": "1. Choose an ad video style",
  "2. Chương trình ưu đãi / Điểm nhấn quảng cáo muốn chèn": "2. Promotion or selling point to feature",
  "4 phân cảnh video quảng cáo (8 giây)": "4 ad scenes (8 seconds)",
  "Tạo video quảng cáo ngay (.webm)": "Create ad video (.webm)",
  "Nghe giọng đọc quảng cáo": "Listen to the ad narration",
  "Tải video quảng cáo về máy (.webm)": "Download ad video (.webm)",
  "Khung video dọc 9:16": "Vertical video preview 9:16",
  "Trình duyệt chưa hỗ trợ tạo file video (hãy dùng Chrome hoặc Edge).": "This browser cannot create video files. Try Chrome or Edge.",
  "Thông tin sản phẩm": "Product information",
  "Nhật ký canh tác & sản xuất thực tế từ nông hộ": "Real farming and production diary from the grower",
  "Xem toàn bộ nhật ký số & hành trình từ vườn →": "View the full digital diary and farm journey →",
  "Mật ong hoa tràm tự nhiên Rừng Trị An": "Natural Melaleuca honey from Tri An Forest",
  "Bột Ca cao nguyên chất Trọng Đức": "Trong Duc pure cacao powder",
  "Hạt điều vỏ lụa rang muối Định Quán": "Dinh Quan roasted cashews",
  "Bột Ca cao nguyên chất Trọng Đức": "Trong Duc Pure Cacao Powder",
  "Hạt điều vỏ lụa rang muối Định Quán": "Dinh Quan Roasted Cashews",
  "Mật ong hoa tràm tự nhiên Rừng Trị An": "Natural Melaleuca Honey from Tri An Forest",
  "Cà phê Robusta mộc Long Khánh": "Long Khanh Natural Robusta Coffee",
  "OCOP 4 sao · Bán chạy nhất": "4-star OCOP · Best seller",
  "OCOP 4 sao · Giòn bùi thơm ngon": "4-star OCOP · Crispy and fragrant",
  "OCOP 4 sao · Thuần khiết thiên nhiên": "4-star OCOP · Pure and natural",
  "OCOP 3 sao · Đậm vị truyền thống": "3-star OCOP · Rich traditional flavor",
  "Công ty TNHH Ca cao Trọng Đức, Định Quán, Đồng Nai": "Trong Duc Cacao Co., Ltd., Dinh Quan, Dong Nai",
  "HTX Nông nghiệp Tân Phú - Định Quán, Đồng Nai": "Tan Phu Agricultural Cooperative, Dinh Quan, Dong Nai",
  "Khu bảo tồn thiên nhiên văn hóa Đồng Nai, Vĩnh Cửu": "Dong Nai Culture and Nature Reserve, Vinh Cuu",
  "Nông trường Cà phê Long Khánh, Đồng Nai": "Long Khanh Coffee Farm, Dong Nai",
  "Hộp 400g (20 gói x 20g)": "400 g box (20 × 20 g sachets)",
  "100% hạt ca cao lên men tự nhiên Đồng Nai": "100% naturally fermented Dong Nai cacao beans",
  "Hũ 500g": "500 g jar",
  "Chai 500ml": "500 ml bottle",
  "Túi 500g": "500 g bag",
  "Hạt điều loại A nguyên hạt (99%), muối tinh khiết (1%)": "Grade A whole cashews (99%), pure salt (1%)",
  "100% mật ong hoa tràm tự nhiên nguyên chất": "100% pure natural Melaleuca honey",
  "100% hạt Robusta chín cây hái chọn lọc": "100% selectively picked, tree-ripened Robusta beans",
  "18 tháng kể từ ngày sản xuất": "18 months from the production date",
  "12 tháng kể từ ngày sản xuất": "12 months from the production date",
  "24 tháng kể từ ngày thu hoạch": "24 months from the harvest date",
  "12 tháng kể từ ngày rang": "12 months from the roasting date",
  "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp": "Store in a cool, dry place away from direct sunlight",
  "Đậy kín sau khi mở, để nơi khô ráo thoáng mát": "Seal after opening and store in a cool, dry place",
  "Nhiệt độ phòng thoáng mát, không bảo quản trong tủ lạnh": "Store at room temperature in a cool, ventilated place; do not refrigerate",
  "Bảo quản nơi khô ráo, tránh không khí và ánh nắng": "Store in a dry place away from air and sunlight",
  "4 sao": "4 stars",
  "3 sao": "3 stars",
  "Vùng trồng ca cao Định Quán được phù sa sông Đồng Nai bồi đắp, kết hợp quy trình ủ lên men tự nhiên theo tiêu chuẩn xuất khẩu Nhật Bản, mang lại hương vị thơm nồng, đậm đà khó quên.": "Dinh Quan's cacao-growing region is enriched by Dong Nai River alluvium. Natural fermentation follows Japanese export standards, creating a rich, memorable aroma and flavor.",
  "Thu hái trái ca cao chín vàng tại vườn xã Phú Hòa, Định Quán. Trái được chọn lọc kỹ càng, đồng đều kích cỡ.": "Ripe yellow cacao pods are hand-picked in Phu Hoa, Dinh Quan, and carefully selected for consistent size.",
  "Tách hạt và ủ lên men tự nhiên trong thùng gỗ sồi 6 ngày đêm, đảo hạt đều đặn để phát triển hương thơm sô-cô-la đặc trưng.": "The beans are removed and naturally fermented in oak barrels for six days and nights, with regular turning to develop their distinctive chocolate aroma.",
  "Nghiền mịn, kiểm tra an toàn vệ sinh thực phẩm và đóng hộp thiếc kín khí kèm tem Hộ chiếu số OCOP.": "The cacao is finely ground, checked for food safety, and sealed in a tin with an OCOP Digital Passport label.",
  "Hạt điều Đồng Nai nổi tiếng với độ giòn rụm, vị ngọt bùi tự nhiên. Được rang củi thủ công giữ trọn lớp vỏ lụa bảo vệ hạt thơm lừng.": "Dong Nai cashews are known for their crisp texture and naturally sweet, nutty flavor. They are wood-roasted by hand with their protective skins intact.",
  "Thu hoạch hạt điều chín rộ vụ xuân tại vùng đất bazan màu mỡ Định Quán.": "Cashews are harvested at peak ripeness during the spring season on Dinh Quan's fertile basalt soil.",
  "Rang củi muối hột theo bí quyết gia truyền và hút chân không bảo quản độ giòn.": "The cashews are wood-roasted with coarse salt using a family recipe, then vacuum-sealed to preserve their crunch.",
  "Mật ong thu hái từ rừng tràm nguyên sinh ven hồ Trị An, màu vàng óng sóng sánh, thơm nhẹ mùi hoa tràm, hàm lượng khoáng chất và enzyme kháng khuẩn tự nhiên cao.": "Harvested from native Melaleuca forests near Tri An Lake, this golden honey has a delicate floral aroma and naturally occurring minerals and antibacterial enzymes.",
  "Quay mật vào sáng sớm khi đàn ong vừa hoàn tất luyện mật hoa tràm rộ nở.": "Honey is collected early in the morning after the bees finish processing nectar from flowering Melaleuca trees.",
  "Được trồng trên sườn đồi thoai thoải Long Khánh với biên độ nhiệt ngày đêm lý tưởng, cho hạt cà phê đậm đà thể chất, hậu vị đầm sâu đặc trưng phương Nam.": "Grown on the gentle hills of Long Khanh, where day-to-night temperatures develop full-bodied beans with a deep Southern Vietnamese finish.",
  "Giòn bùi thơm ngon": "Crispy, rich, and fragrant",
  "Thuần khiết thiên nhiên": "Pure and natural",
  "Sản phẩm mới": "New product",
};

const translationMap = (() => {
  const map = new Map(Object.entries(PAGE_EN));
  const collect = (vi, en) => {
    if (typeof vi === "string" && typeof en === "string") {
      if (vi !== en) map.set(vi, en);
      return;
    }
    if (Array.isArray(vi) && Array.isArray(en)) {
      vi.forEach((value, index) => collect(value, en[index]));
      return;
    }
    if (vi && en && typeof vi === "object" && typeof en === "object") {
      Object.keys(vi).forEach((key) => collect(vi[key], en[key]));
    }
  };
  collect(DICT.vi, DICT.en);
  return [...map.entries()].sort(([a], [b]) => b.length - a.length);
})();

const nodeSources = new WeakMap();
const attributeSources = new WeakMap();
const TEXT_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];

const WINDOWS_1252_BYTES = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
  [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
  [0x017e, 0x9e], [0x0178, 0x9f],
]);

function repairVietnameseEncoding(value) {
  if (!/[ÃÂÄÅÆá»áºâ]/.test(value)) return value;
  const bytes = [];
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (WINDOWS_1252_BYTES.has(code)) bytes.push(WINDOWS_1252_BYTES.get(code));
    else return value;
  }
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    return decoded && !/[ÃÂÄÅÆá»áºâ]/.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
}

const normalizedTranslationMap = translationMap
  .map(([source, target]) => [repairVietnameseEncoding(source), target])
  .filter(([source]) => source.length > 0)
  .sort(([a], [b]) => b.length - a.length);
const translationLookup = new Map(normalizedTranslationMap);
const translationPattern = new RegExp(
  normalizedTranslationMap.map(([source]) => source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "g"
);

export function translateUI(value, lang) {
  if (!value) return value;
  const result = repairVietnameseEncoding(value);
  if (lang !== "en") return result;
  return result.replace(translationPattern, (source) => translationLookup.get(source) ?? source);
}

function translateNode(node, lang) {
  const current = node.nodeValue;
  let record = nodeSources.get(node);
  if (!record || record.applied !== current) record = { source: current, applied: current };
  const next = translateUI(record.source, lang);
  if (next !== current) node.nodeValue = next;
  record.applied = next;
  nodeSources.set(node, record);
}

function translateAttributes(element, lang) {
  for (const name of TEXT_ATTRIBUTES) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name);
    let records = attributeSources.get(element);
    if (!records) {
      records = new Map();
      attributeSources.set(element, records);
    }
    let record = records.get(name);
    if (!record || record.applied !== current) record = { source: current, applied: current };
    const next = translateUI(record.source, lang);
    if (next !== current) element.setAttribute(name, next);
    record.applied = next;
    records.set(name, record);
  }
}

function localizeSubtree(root, lang) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (!root.parentElement?.closest("script, style, textarea, noscript, [contenteditable='true']")) translateNode(root, lang);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
  if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root, lang);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement?.closest("script, style, textarea, noscript, [contenteditable='true']")) translateNode(node, lang);
  }
  if (root.querySelectorAll) root.querySelectorAll(TEXT_ATTRIBUTES.map((name) => `[${name}]`).join(",")).forEach((element) => translateAttributes(element, lang));
}

export default function LanguageTextSync() {
  const { lang } = useLang();
  const path = usePathname();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "en"
      ? "OCOP Passport · Digital Passports for Dong Nai Produce"
      : "OCOP Passport · Hộ chiếu số cho nông sản Đồng Nai";
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = lang === "en"
        ? "Record production with photos and voice, then share transparent OCOP product passports through dynamic QR codes."
        : "Ghi nhật ký sản xuất bằng ảnh và giọng nói, tạo hộ chiếu số qua mã QR động cho sản phẩm OCOP Đồng Nai.";
    }
    localizeSubtree(document.body, lang);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateNode(mutation.target, lang);
        } else if (mutation.type === "attributes") {
          translateAttributes(mutation.target, lang);
        } else {
          mutation.addedNodes.forEach((node) => localizeSubtree(node, lang));
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TEXT_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [lang, path]);

  return null;
}
