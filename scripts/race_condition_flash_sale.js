// scripts/race_condition_flash_sale.js
/**
 * SIMULATION: Giải quyết triệt để Race Condition trong Flash Sale / Bán vé
 * Tình huống: Kho chỉ còn ĐÚNG 1 SẢN PHẨM, 100 người mua đồng thời.
 */

// ============================================================================
// 1. MÔ PHỎNG DATABASE ATOMIC ENGINE (Row-level Locking & Atomic Conditional Update)
// ============================================================================
class MockDatabase {
  constructor() {
    this.product = { id: "TICKET-VIP-001", name: "Vé VIP Chung Kết", stock: 1 };
    this.orders = [];
    this._rowLock = false; // Mô phỏng exclusive row lock cấp database
    this._lockQueue = [];
  }

  // Cơ chế Row Lock (tương tự Row-Level Lock của PostgreSQL / MySQL InnoDB)
  async _acquireRowLock() {
    if (!this._rowLock) {
      this._rowLock = true;
      return;
    }
    await new Promise((resolve) => this._lockQueue.push(resolve));
  }

  _releaseRowLock() {
    if (this._lockQueue.length > 0) {
      const next = this._lockQueue.shift();
      next();
    } else {
      this._rowLock = false;
    }
  }

  /**
   * PHƯƠNG PHÁP 1: ATOMIC CONDITIONAL UPDATE (Gold Standard)
   * Tương đương câu SQL:
   * UPDATE products
   * SET stock = stock - 1
   * WHERE id = 'TICKET-VIP-001' AND stock >= 1
   * RETURNING stock;
   */
  async atomicConditionalPurchase(userId) {
    await this._acquireRowLock();
    try {
      // Mô phỏng độ trễ I/O vi mô của database (5-15ms)
      await new Promise((r) => setTimeout(r, Math.random() * 10 + 5));

      // Kiểm tra điều kiện trực tiếp tại thời điểm update
      if (this.product.stock >= 1) {
        this.product.stock -= 1; // Trừ kho
        const orderId = `ORD-${Date.now()}-${userId}`;
        this.orders.push({ orderId, userId, productId: this.product.id });
        return { success: true, orderId, remainingStock: this.product.stock };
      } else {
        return { success: false, reason: "OUT_OF_STOCK", remainingStock: this.product.stock };
      }
    } finally {
      this._releaseRowLock();
    }
  }

  /**
   * MÔ PHỎNG BỊ LỖI RACE CONDITION (Nếu lập trình sai: Read-Then-Write không có lock)
   * if (product.stock > 0) { wait...; product.stock -= 1; }
   */
  async naiveUnsafePurchase(userId) {
    // 1. Đọc kho trước
    const currentStock = this.product.stock;

    // Giả sử có độ trễ đọc dữ liệu và xử lý nghiệp vụ 10ms
    await new Promise((r) => setTimeout(r, 10));

    // 2. Kiểm tra điều kiện trên dữ liệu đã đọc
    if (currentStock > 0) {
      this.product.stock -= 1; // Trừ kho -> DẪN ĐẾN KHO BỊ ÂM!
      return { success: true, remainingStock: this.product.stock };
    }
    return { success: false, reason: "OUT_OF_STOCK" };
  }
}

// ============================================================================
// 2. KỊCH BẢN SIMULATION: 100 REQUESTS BẮN VÀO CÙNG 1 THỜI ĐIỂM
// ============================================================================
async function runSimulation() {
  console.log("=================================================================");
  console.log("⚡ BẮT ĐẦU SIMULATION: FLASH SALE VÉ VIP (100 REQUESTS ĐỒNG THỜI)");
  console.log("=================================================================");

  // --- THỬ NGHIỆM 1: CÁCH TIẾP CẬN SAI (GÂY RA OVERSELLING / KHO ÂM) ---
  console.log("\n[TEST 1] Chạy với mã nguồn thông thường KHÔNG CÓ Atomic Lock (Naive approach):");
  const badDb = new MockDatabase();
  console.log(`- Tồn kho ban đầu: ${badDb.product.stock}`);

  const badRequests = Array.from({ length: 50 }, (_, i) =>
    badDb.naiveUnsafePurchase(`User_${i + 1}`)
  );
  const badResults = await Promise.all(badRequests);
  const badSuccessCount = badResults.filter((r) => r.success).length;

  console.log(`- Số request thành công: ${badSuccessCount}/50`);
  console.log(`- Tồn kho sau cùng: ${badDb.product.stock}`);
  if (badDb.product.stock < 0) {
    console.log(`❌ CẢNH BÁO: ĐÃ XẢY RA LỖI RACE CONDITION! Kho bị âm (${badDb.product.stock}), bán vượt quá số lượng tồn!`);
  }

  // --- THỬ NGHIỆM 2: CÁCH TIẾP CẬN CHUẨN (ATOMIC CONDITIONAL UPDATE) ---
  console.log("\n-----------------------------------------------------------------");
  console.log("[TEST 2] Chạy với cơ chế ATOMIC CONDITIONAL UPDATE (Chống Race Condition):");
  const safeDb = new MockDatabase();
  console.log(`- Tồn kho ban đầu: ${safeDb.product.stock}`);

  const TOTAL_USERS = 100;
  console.log(`- Đang kích hoạt đồng thời ${TOTAL_USERS} người dùng bấm mua...`);

  const startTime = Date.now();
  // Bắn đồng thời 100 request tại cùng 1 microsecond
  const safeRequests = Array.from({ length: TOTAL_USERS }, (_, i) =>
    safeDb.atomicConditionalPurchase(`User_${i + 1}`)
  );
  const safeResults = await Promise.all(safeRequests);
  const duration = Date.now() - startTime;

  let successCount = 0;
  let failCount = 0;
  let winner = null;

  safeResults.forEach((res, idx) => {
    if (res.success) {
      successCount++;
      winner = `User_${idx + 1} (Mã đơn: ${res.orderId})`;
    } else {
      failCount++;
    }
  });

  console.log("\n📊 KẾT QUẢ XỬ LÝ:");
  console.log(`  ✓ Số giao dịch THÀNH CÔNG: ${successCount} (Người trúng: ${winner})`);
  console.log(`  ✗ Số giao dịch BỊ TỪ CHỐI (Hết hàng): ${failCount}/${TOTAL_USERS}`);
  console.log(`  📦 Tồn kho thực tế cuối cùng: ${safeDb.product.stock}`);
  console.log(`  ⏱️ Tổng thời gian xử lý: ${duration}ms`);

  if (successCount === 1 && safeDb.product.stock === 0 && failCount === TOTAL_USERS - 1) {
    console.log("\n🎉 KẾT QUẢ: TEST HOÀN TOÀN THÀNH CÔNG! Tuyệt đối không bị bán lặp, không bị âm kho!");
  } else {
    console.log("\n❌ THẤT BẠI: Dữ liệu vẫn bị lỗi!");
  }
}

runSimulation();
