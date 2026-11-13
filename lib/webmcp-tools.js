// lib/webmcp-tools.js
/**
 * WebMCP Tool Definitions & Dispatcher cho Hệ thống OCOP Passport Đồng Nai
 * Cho phép AI Agent tự động thao tác trên website không cần giao diện đồ họa (GUI).
 */

export const WEBMCP_TOOLS = [
  {
    name: "searchOCOPProduct",
    description: "Tìm kiếm đặc sản OCOP Đồng Nai theo tên, danh mục, mức sao chứng nhận hoặc khoảng giá.",
    parameters: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "Từ khóa tìm kiếm (Ví dụ: 'ca cao', 'hạt điều', 'bưởi Tân Triều', 'mật ong')",
        },
        category: {
          type: "string",
          enum: [
            "Tất cả",
            "Bột Ca cao & Socola",
            "Cà phê & Hạt điều",
            "Mật ong & Trái cây sấy",
            "Rượu & Trà đặc sản",
          ],
          description: "Danh mục phân loại sản phẩm",
        },
        min_stars: {
          type: "integer",
          minimum: 3,
          maximum: 5,
          description: "Xếp hạng sao OCOP tối thiểu (3, 4 hoặc 5 sao)",
        },
        max_price: {
          type: "integer",
          description: "Mức giá tối đa tính bằng VNĐ (Ví dụ: 200000)",
        },
      },
      required: [],
    },
  },

  {
    name: "lookupPassport",
    description: "Tra cứu Hộ chiếu số QR và minh bạch hành trình lô hàng nông sản từ vườn trồng Đồng Nai.",
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Mã định danh sản phẩm hoặc slug (Ví dụ: 'pure-cacao-72', 'hat-dieu-xuan-loc')",
        },
        lot_code: {
          type: "string",
          description: "Mã số lô hàng in trên tem QR (Ví dụ: '13D0', 'QIEV')",
        },
        include_timeline: {
          type: "boolean",
          default: true,
          description: "Có lấy toàn bộ các mốc nhật ký sản xuất, ảnh thu hoạch và tọa độ GPS không",
        },
      },
      required: ["product_id"],
    },
  },

  {
    name: "buildGiftBox",
    description: "Tạo Hộp quà đặc sản Đồng Nai (Hộp lục giác tổ ong) phối hợp từ các món đặc sản đã chọn.",
    parameters: {
      type: "object",
      properties: {
        box_type: {
          type: "string",
          enum: ["luc-giac-to-ong", "hop-qua-tet", "hop-qua-tieu-chuan"],
          default: "luc-giac-to-ong",
          description: "Kiểu dáng đóng hộp quà",
        },
        selected_item_ids: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 7,
          description: "Danh sách 2 đến 7 mã sản phẩm muốn xếp vào hộp quà",
        },
        greeting_message: {
          type: "string",
          description: "Lời chúc in trên thiệp gỗ đính kèm (Ví dụ: 'Kính chúc Quý khách An khang thịnh vượng')",
        },
      },
      required: ["selected_item_ids"],
    },
  },

  {
    name: "placeOrder",
    description: "Xác nhận đặt mua hàng tận vườn và thanh toán an toàn với cơ chế chống trừ tiền 2 lần (Idempotency Key).",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_id: { type: "string", description: "Mã sản phẩm" },
              quantity: { type: "integer", minimum: 1, description: "Số lượng" },
            },
            required: ["product_id", "quantity"],
          },
          description: "Danh sách sản phẩm và số lượng đặt mua",
        },
        customer_name: {
          type: "string",
          description: "Họ và tên người nhận hàng",
        },
        phone: {
          type: "string",
          description: "Số điện thoại liên hệ nhận hàng",
        },
        shipping_address: {
          type: "string",
          description: "Địa chỉ nhận hàng chi tiết (Số nhà, đường, xã/phường, tỉnh thành)",
        },
        payment_method: {
          type: "string",
          enum: ["COD", "VIETQR", "MOMO", "WALLET"],
          default: "COD",
          description: "Phương thức thanh toán",
        },
        idempotency_key: {
          type: "string",
          format: "uuid",
          description: "Mã UUID v4 duy nhất bảo vệ phiên thanh toán chống Double Charge",
        },
      },
      required: ["items", "customer_name", "phone", "shipping_address", "idempotency_key"],
    },
  },

  {
    name: "logFarmerDiary",
    description: "Ghi mốc nhật ký sản xuất số mới cho nông hộ hoặc tình nguyện viên Đoàn xã phường.",
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Mã sản phẩm cần ghi nhật ký",
        },
        stage_title: {
          type: "string",
          enum: [
            "Làm đất & Xuống giống",
            "Chăm sóc & Bón phân hữu cơ",
            "Thu hoạch tận vườn",
            "Sơ chế & Phơi sấy lên men",
            "Đóng gói & Dán tem QR Hộ chiếu",
          ],
          description: "Tên công đoạn sản xuất",
        },
        content: {
          type: "string",
          description: "Nội dung ghi chép hoặc bản phiên âm giọng nói của nông dân",
        },
        farmer_name: {
          type: "string",
          description: "Tên nông hộ hoặc tình nguyện viên ghi hộ",
        },
        location: {
          type: "string",
          description: "Địa danh vườn trồng (Ví dụ: 'Xã Phú Lý, Huyện Vĩnh Cửu, Đồng Nai')",
        },
      },
      required: ["product_id", "stage_title", "content"],
    },
  },
];
