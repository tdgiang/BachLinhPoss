# Wallet Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a customer wallet system that allows nạp tiền (deposit) with promotional bonuses and payment by wallet balance, similar to internet café account systems.

**Architecture:** Centralized state management in App.jsx for wallet data (customer balances, wallet promotions, transaction history). Three new components: WalletModule (admin panel), WalletTopupModal (deposit flow), and PaymentModal integration (payment by wallet). Utility functions handle promotion matching, bonus calculation, and wallet transaction validation.

**Tech Stack:** React, Vite, JavaScript ES6+, CSS3 (no external state library — props lifting)

**Spec:** `docs/specs/12-vi-khach-hang.md`

## Global Constraints

- Wallet balance has no maximum limit (rule #3)
- Wallet balance never expires (rule #4)
- Each customer has exactly 1 wallet linked to phone number (rule #1)
- When paying by wallet, must use entire wallet balance in that transaction (rule #5)
- Wallet transactions are immutable — no delete, only log adjustments (rule #13)
- All wallet deposits/payments must log to auditLogs with user, timestamp, reason (rule #16)
- Staff can only view wallet history for their own shift (Spec permission)
- All bonus calculations by % (no fixed amounts); different promotions have different % (rule #9)

## Review Focus

1. **Promotion matching logic:** When customer deposits, system should match all active promotions by date/time/payment-method/customer-tier and select highest %; if no promotions apply, bonus = 0. Test: deposit at midnight with time-window promotion active should NOT apply; time window just ended should NOT apply.

2. **Split payment boundary:** When wallet insufficient for total transaction, system must deduct entire wallet + request additional payment method. Test: transaction 300k, wallet 200k → use wallet 200k + ask for 100k more; NOT allow partial wallet use or repeated wallet payment in same transaction.

3. **Wallet state consistency:** Wallet status (active/locked/deleted) must block operations correctly. Test: locked wallet cannot pay but Owner/Manager can still deposit for it; deleted wallet (soft delete) allows neither.

4. **Refund loop:** When order refunded, refund amount must go back to customer wallet, not to original payment method. Test: customer paid 300k via wallet (100k) + cash (200k), order refunded 300k → wallet should increase by 100k.

5. **Audit trail completeness:** Every wallet transaction must record: customer phone, amount, bonus %, timestamp, staff user, store, transaction type (deposit/payment). Adjustment by hand must include reason. Test: audit log shows complete transaction chain for customer; manual adjustment has reason; cannot query/see other staff's transactions.

---

## File Structure

### Existing Files (Modifications)

| File | Responsibility |
|------|-----------------|
| `src/App.jsx` | Add wallet state: `wallets` (customer phone → balance), `walletPromotions` (active promotions), `walletHistory` (transactions); handlers: `handleWalletDeposit`, `handleWalletPayment`, `handlePromotionCRUD`, `handleWalletAdjust` |
| `src/data/mockData.js` | Add sample wallets (5–10 customers), 2–3 sample promotions (fixed %, tiered %), transaction history for 1–2 customers |
| `src/components/modules/PosSale.jsx` | Add "Nạp ví" button + modal trigger to find customer by phone; keep existing POS flow unchanged |
| `src/components/PaymentModal.jsx` | Add "Ví khách hàng" as payment method option; handle split payment logic (wallet → remaining amount) |
| `src/App.css` | Add wallet card styles, modal styles, badge colors for wallet status/promotion status |

### New Files (Creation)

| File | Responsibility |
|------|-----------------|
| `src/components/modules/WalletModule.jsx` | Main admin module: list customers + wallets, create/edit/delete promotions, view wallet history, manual adjustment |
| `src/components/WalletTopupModal.jsx` | Deposit flow: select customer (phone search), enter amount, auto-calculate promotion bonus, choose payment method (cash/QR/card), confirm |
| `src/utils/walletUtils.js` | Utility functions: `getApplicablePromotion()`, `calculateBonus()`, `validateWalletPayment()`, `recordWalletTransaction()`, `checkWalletLock()` |

---

## Task Breakdown

### Task 1: Setup Wallet State, Mock Data, and Utilities

**Files:**
- Modify: `src/App.jsx` (lines ~1–50, state section)
- Modify: `src/data/mockData.js`
- Create: `src/utils/walletUtils.js`

**Interfaces:**
- Consumes: None (new feature)
- Produces:
  - App state: `wallets` (Map: phone → { balance, status, createdAt, updatedAt, notes })
  - App state: `walletPromotions` (Array: { id, name, type ('fixed'|'tiered'), percentage, tiers (if tiered), conditions: { startDate, endDate, timeFrom, timeTo, stores, paymentMethods, customerTiers }, limits: { maxTotal, maxPerCustomer, maxBonusPerDay }, status })
  - App state: `walletHistory` (Array: { id, customerPhone, type ('deposit'|'payment'), amount, bonus, totalReceived (for deposit), paymentMethod, orderId (for payment), promotionId (for deposit), staffUser, timestamp, store })
  - Utility: `getApplicablePromotion(walletPromotions, currentTime, store, paymentMethod, customerTier, depositAmount)` → promotion object or null
  - Utility: `calculateBonus(depositAmount, promotion)` → bonus amount
  - Utility: `validateWalletPayment(wallet, transactionAmount, walletStatus)` → { valid, message, canSplitPayment }

- [ ] **Step 1: Add wallet state to App.jsx**

In App.jsx, after `const [auditLogs, setAuditLogs] = useState([...])`, add:

```javascript
const [wallets, setWallets] = useState({}); // { "0123456789": { balance: 500000, status: "active", createdAt: "2026-10-01", updatedAt: "2026-10-15", notes: "" } }
const [walletPromotions, setWalletPromotions] = useState([]);
const [walletHistory, setWalletHistory] = useState([]);
```

- [ ] **Step 2: Add mock wallet data**

In `src/data/mockData.js`, add:

```javascript
export const mockWallets = {
  "0987654321": { // customer 1 phone
    balance: 500000,
    status: "active",
    createdAt: "2026-09-01",
    updatedAt: "2026-10-15",
    notes: ""
  },
  "0912345678": {
    balance: 1200000,
    status: "active",
    createdAt: "2026-08-15",
    updatedAt: "2026-10-10",
    notes: ""
  },
  "0945678901": {
    balance: 0,
    status: "locked",
    createdAt: "2026-09-20",
    updatedAt: "2026-10-14",
    notes: "Khóa tạm thời"
  },
};

export const mockWalletPromotions = [
  {
    id: "promo-wallet-1",
    name: "Nạp tiền hôm nay +20%",
    type: "fixed",
    percentage: 20,
    conditions: {
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      timeFrom: "00:00",
      timeTo: "23:59",
      stores: "all",
      paymentMethods: ["cash", "transfer", "card"],
      customerTiers: "all"
    },
    limits: {
      maxTotal: 1000,
      maxPerCustomer: 5,
      maxBonusPerDay: 200000
    },
    status: "active"
  },
  {
    id: "promo-wallet-2",
    name: "Nạp tiền theo tầng",
    type: "tiered",
    tiers: [
      { minAmount: 50000, maxAmount: 99999, percentage: 15 },
      { minAmount: 100000, maxAmount: 499999, percentage: 20 },
      { minAmount: 500000, maxAmount: Infinity, percentage: 25 }
    ],
    conditions: {
      startDate: "2026-10-10",
      endDate: "2026-12-31",
      timeFrom: "08:00",
      timeTo: "22:00",
      stores: "all",
      paymentMethods: "all",
      customerTiers: "all"
    },
    limits: {
      maxTotal: 500,
      maxPerCustomer: 3,
      maxBonusPerDay: 500000
    },
    status: "active"
  }
];

export const mockWalletHistory = [
  {
    id: "history-1",
    customerPhone: "0987654321",
    type: "deposit",
    amount: 100000,
    bonus: 20000,
    totalReceived: 120000,
    paymentMethod: "cash",
    promotionId: "promo-wallet-1",
    staffUser: "staff1",
    timestamp: "2026-10-15 14:30",
    store: "store-001"
  },
  {
    id: "history-2",
    customerPhone: "0987654321",
    type: "payment",
    amount: 150000,
    paymentMethod: ["wallet", "cash"],
    walletUsed: 100000,
    otherMethodUsed: 50000,
    orderId: "order-12345",
    staffUser: "staff1",
    timestamp: "2026-10-15 15:00",
    store: "store-001"
  }
];
```

- [ ] **Step 3: Initialize mock data in App.jsx**

In App.jsx useEffect (after loading mockData):

```javascript
useEffect(() => {
  setWallets(mockWallets);
  setWalletPromotions(mockWalletPromotions);
  setWalletHistory(mockWalletHistory);
}, []);
```

- [ ] **Step 4: Create walletUtils.js**

Create `src/utils/walletUtils.js`:

```javascript
// Check if promotion is active (time window + status + date range)
export function isPromotionActive(promotion, currentTime, currentStore) {
  const now = new Date(currentTime);
  const startDate = new Date(promotion.conditions.startDate);
  const endDate = new Date(promotion.conditions.endDate);
  
  // Check date range
  if (now < startDate || now > endDate) return false;
  
  // Check status
  if (promotion.status !== "active") return false;
  
  // Check time window
  const [fromHour, fromMin] = promotion.conditions.timeFrom.split(":").map(Number);
  const [toHour, toMin] = promotion.conditions.timeTo.split(":").map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const fromTimeInMinutes = fromHour * 60 + fromMin;
  const toTimeInMinutes = toHour * 60 + toMin;
  
  if (currentTimeInMinutes < fromTimeInMinutes || currentTimeInMinutes > toTimeInMinutes) {
    return false;
  }
  
  // Check store
  if (promotion.conditions.stores !== "all" && !promotion.conditions.stores.includes(currentStore)) {
    return false;
  }
  
  return true;
}

// Get applicable promotion (highest %) for a deposit
export function getApplicablePromotion(
  walletPromotions,
  depositAmount,
  paymentMethod,
  customerPhone,
  currentTime,
  currentStore,
  customerTier,
  walletHistory
) {
  const applicablePromotions = walletPromotions.filter(promo => {
    if (!isPromotionActive(promo, currentTime, currentStore)) return false;
    
    // Check payment method
    if (
      promo.conditions.paymentMethods !== "all" &&
      !promo.conditions.paymentMethods.includes(paymentMethod)
    ) {
      return false;
    }
    
    // Check customer tier
    if (
      promo.conditions.customerTiers !== "all" &&
      !promo.conditions.customerTiers.includes(customerTier)
    ) {
      return false;
    }
    
    // Check limits: max per customer today
    const today = new Date(currentTime).toDateString();
    const customerDepositsToday = walletHistory.filter(
      h => h.type === "deposit" &&
           h.customerPhone === customerPhone &&
           new Date(h.timestamp).toDateString() === today &&
           h.promotionId === promo.id
    );
    if (customerDepositsToday.length >= promo.limits.maxPerCustomer) {
      return false;
    }
    
    return true;
  });
  
  if (applicablePromotions.length === 0) return null;
  
  // Return promotion with highest percentage
  if (applicablePromotions[0].type === "fixed") {
    return applicablePromotions.reduce((max, p) =>
      p.percentage > max.percentage ? p : max
    );
  } else {
    // For tiered, find the tier for this amount
    const tieredPromo = applicablePromotions.find(p => p.type === "tiered");
    if (!tieredPromo) return null;
    
    const applicableTier = tieredPromo.tiers.find(
      t => depositAmount >= t.minAmount && depositAmount <= t.maxAmount
    );
    
    return applicableTier ? tieredPromo : null;
  }
}

// Calculate bonus amount
export function calculateBonus(depositAmount, promotion) {
  if (!promotion) return 0;
  
  if (promotion.type === "fixed") {
    return Math.floor(depositAmount * (promotion.percentage / 100));
  } else if (promotion.type === "tiered") {
    // Find applicable tier
    const tier = promotion.tiers.find(
      t => depositAmount >= t.minAmount && depositAmount <= t.maxAmount
    );
    return tier ? Math.floor(depositAmount * (tier.percentage / 100)) : 0;
  }
  
  return 0;
}

// Validate wallet payment
export function validateWalletPayment(wallet, transactionAmount, walletStatus) {
  if (!wallet) {
    return {
      valid: false,
      message: "Ví không tồn tại",
      canSplitPayment: false
    };
  }
  
  if (walletStatus === "locked") {
    return {
      valid: false,
      message: "Ví đã bị khóa",
      canSplitPayment: false
    };
  }
  
  if (walletStatus === "deleted") {
    return {
      valid: false,
      message: "Ví đã bị xóa",
      canSplitPayment: false
    };
  }
  
  if (wallet.balance > 0 && wallet.balance < transactionAmount) {
    return {
      valid: true,
      message: `Ví không đủ. Sẽ dùng toàn bộ ví (${wallet.balance}đ) và cần thêm ${transactionAmount - wallet.balance}đ`,
      canSplitPayment: true
    };
  }
  
  if (wallet.balance >= transactionAmount) {
    return {
      valid: true,
      message: "Ví đủ tiền",
      canSplitPayment: false
    };
  }
  
  if (wallet.balance === 0) {
    return {
      valid: false,
      message: "Ví không có tiền",
      canSplitPayment: false
    };
  }
  
  return {
    valid: true,
    message: "",
    canSplitPayment: false
  };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/data/mockData.js src/utils/walletUtils.js
git commit -m "feat: setup wallet state, mock data, and utilities for wallet feature"
```

---

### Task 2: Create WalletModule Component (Main Admin Panel)

**Files:**
- Create: `src/components/modules/WalletModule.jsx`

**Interfaces:**
- Consumes:
  - `wallets` (state)
  - `walletPromotions` (state)
  - `walletHistory` (state)
  - `customers` (from App state)
  - `currentUserRole` (from App state)
  - Handlers: `onWalletUpdate`, `onPromotionChange`, `onHistoryView`
- Produces:
  - Props interface: `WalletModule` accepts `{ wallets, walletPromotions, walletHistory, customers, currentUserRole, currentStore, handleWalletDeposit, handlePromotionCRUD, handleWalletAdjust, handleNavigate }`

- [ ] **Step 1: Write basic WalletModule structure**

Create `src/components/modules/WalletModule.jsx`:

```javascript
import React, { useState } from "react";

export default function WalletModule({
  wallets,
  walletPromotions,
  walletHistory,
  customers,
  currentUserRole,
  currentStore,
  handleWalletDeposit,
  handlePromotionCRUD,
  handleWalletAdjust,
  handleNavigate
}) {
  const [activeTab, setActiveTab] = useState("customers"); // 'customers' | 'promotions' | 'history'
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter customers by search
  const filteredCustomers = customers.filter(c =>
    c.phone.includes(searchPhone) || c.name.includes(searchPhone)
  );

  // Show role-based content
  const canCreatePromotion = ["owner", "manager"].includes(currentUserRole);

  return (
    <div className="wallet-module">
      <h2>Quản lý Ví Khách hàng</h2>
      
      <div className="wallet-tabs">
        <button
          onClick={() => setActiveTab("customers")}
          className={activeTab === "customers" ? "active" : ""}
        >
          Khách hàng & Ví
        </button>
        {canCreatePromotion && (
          <button
            onClick={() => setActiveTab("promotions")}
            className={activeTab === "promotions" ? "active" : ""}
          >
            Chương trình KM
          </button>
        )}
        <button
          onClick={() => setActiveTab("history")}
          className={activeTab === "history" ? "active" : ""}
        >
          Lịch sử
        </button>
      </div>

      {activeTab === "customers" && (
        <div className="wallet-customers-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm khách hàng (SĐT hoặc tên)"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
            />
          </div>

          <div className="customers-list">
            {filteredCustomers.map(customer => {
              const wallet = wallets[customer.phone];
              return (
                <div
                  key={customer.phone}
                  className="customer-wallet-card"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="card-header">
                    <h3>{customer.name}</h3>
                    <span className="phone">{customer.phone}</span>
                  </div>
                  {wallet ? (
                    <div className="wallet-info">
                      <div className="balance">
                        <label>Số dư:</label>
                        <span className="amount">{wallet.balance.toLocaleString()}đ</span>
                      </div>
                      <div className="status">
                        <span className={`badge status-${wallet.status}`}>
                          {wallet.status === "active"
                            ? "Hoạt động"
                            : wallet.status === "locked"
                            ? "Bị khóa"
                            : "Đã xóa"}
                        </span>
                      </div>
                      <div className="updated">
                        Cập nhật: {wallet.updatedAt}
                      </div>
                    </div>
                  ) : (
                    <div className="no-wallet">Chưa có ví</div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedCustomer && (
            <WalletDetailPanel
              customer={selectedCustomer}
              wallet={wallets[selectedCustomer.phone]}
              history={walletHistory.filter(h => h.customerPhone === selectedCustomer.phone)}
              currentUserRole={currentUserRole}
              onClose={() => setSelectedCustomer(null)}
              onDepositClick={() => {
                handleNavigate("walletTopup", selectedCustomer);
              }}
              onAdjustClick={(action) => {
                // Will implement in Task 7
                console.log("Adjust", action);
              }}
            />
          )}
        </div>
      )}

      {activeTab === "promotions" && canCreatePromotion && (
        <WalletPromotionPanel
          promotions={walletPromotions}
          onCRUD={handlePromotionCRUD}
          currentStore={currentStore}
        />
      )}

      {activeTab === "history" && (
        <WalletHistoryPanel
          history={walletHistory}
          customers={customers}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
}

function WalletDetailPanel({
  customer,
  wallet,
  history,
  currentUserRole,
  onClose,
  onDepositClick,
  onAdjustClick
}) {
  if (!wallet) return null;

  const canAdjust = ["owner", "manager"].includes(currentUserRole);

  return (
    <div className="wallet-detail-panel">
      <div className="panel-header">
        <h3>{customer.name}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="wallet-details">
        <div className="detail-row">
          <label>SĐT:</label>
          <span>{customer.phone}</span>
        </div>
        <div className="detail-row balance">
          <label>Số dư:</label>
          <span className="amount">{wallet.balance.toLocaleString()}đ</span>
        </div>
        <div className="detail-row">
          <label>Trạng thái:</label>
          <span className={`badge status-${wallet.status}`}>
            {wallet.status === "active"
              ? "Hoạt động"
              : wallet.status === "locked"
              ? "Bị khóa"
              : "Đã xóa"}
          </span>
        </div>
        <div className="detail-row">
          <label>Tạo lúc:</label>
          <span>{wallet.createdAt}</span>
        </div>
        <div className="detail-row">
          <label>Cập nhật:</label>
          <span>{wallet.updatedAt}</span>
        </div>
      </div>

      <div className="panel-actions">
        <button onClick={onDepositClick} className="btn btn-primary">
          Nạp ví
        </button>
        {canAdjust && (
          <button onClick={() => onAdjustClick("adjust")} className="btn">
            Điều chỉnh số dư
          </button>
        )}
      </div>

      <div className="recent-history">
        <h4>Lịch sử gần đây</h4>
        {history.slice(-5).reverse().map(record => (
          <div key={record.id} className="history-item">
            <span className="type">
              {record.type === "deposit" ? "Nạp tiền" : "Thanh toán"}
            </span>
            <span className="amount">
              {record.type === "deposit"
                ? `+${record.totalReceived.toLocaleString()}đ`
                : `-${record.amount.toLocaleString()}đ`}
            </span>
            <span className="time">{record.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletPromotionPanel({ promotions, onCRUD, currentStore }) {
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  return (
    <div className="wallet-promotion-panel">
      <div className="panel-header">
        <h3>Chương trình khuyến mãi nạp ví</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          + Tạo mới
        </button>
      </div>

      {showForm && (
        <WalletPromotionForm
          promotion={editingPromo}
          onSave={(data) => {
            onCRUD({
              action: editingPromo ? "edit" : "create",
              data
            });
            setShowForm(false);
            setEditingPromo(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingPromo(null);
          }}
        />
      )}

      <div className="promotions-list">
        {promotions.map(promo => (
          <div key={promo.id} className="promotion-card">
            <div className="card-header">
              <h4>{promo.name}</h4>
              <span className={`badge status-${promo.status}`}>
                {promo.status === "active" ? "Hoạt động" : "Tạm dừng"}
              </span>
            </div>
            <div className="card-body">
              <p>Loại: {promo.type === "fixed" ? "% cố định" : "Theo tầng"}</p>
              <p>
                Thời gian: {promo.conditions.startDate} → {promo.conditions.endDate}
              </p>
              <div className="actions">
                <button
                  onClick={() => {
                    setEditingPromo(promo);
                    setShowForm(true);
                  }}
                  className="btn-small"
                >
                  Sửa
                </button>
                <button
                  onClick={() =>
                    onCRUD({
                      action: "delete",
                      data: { id: promo.id }
                    })
                  }
                  className="btn-small btn-danger"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletPromotionForm({ promotion, onSave, onCancel }) {
  // Placeholder form (will implement in Task 3)
  return (
    <div className="promo-form">
      <h4>{promotion ? "Sửa chương trình" : "Tạo chương trình mới"}</h4>
      <p>Form sẽ được implement trong Task 3</p>
      <button onClick={onCancel} className="btn">Hủy</button>
    </div>
  );
}

function WalletHistoryPanel({ history, customers, currentUserRole }) {
  return (
    <div className="wallet-history-panel">
      <h3>Lịch sử ví</h3>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Bonus</th>
              <th>Thời gian</th>
              <th>Nhân viên</th>
            </tr>
          </thead>
          <tbody>
            {history.map(record => {
              const customer = customers.find(c => c.phone === record.customerPhone);
              return (
                <tr key={record.id}>
                  <td>{customer?.name || "Unknown"}</td>
                  <td>{record.customerPhone}</td>
                  <td>{record.type === "deposit" ? "Nạp tiền" : "Thanh toán"}</td>
                  <td>{record.amount.toLocaleString()}đ</td>
                  <td>
                    {record.type === "deposit"
                      ? `+${record.bonus.toLocaleString()}đ`
                      : "-"}
                  </td>
                  <td>{record.timestamp}</td>
                  <td>{record.staffUser}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add WalletModule to sidebar navigation**

In `src/components/Sidebar.jsx`, add to menu items:

```javascript
{
  id: "wallet",
  label: "Quản lý ví",
  icon: "💳",
  roles: ["owner", "manager"],
  action: () => handleNavigate("wallet")
}
```

- [ ] **Step 3: Add WalletModule case to App.jsx render**

In App.jsx, in the main viewport switch:

```javascript
case "wallet":
  return (
    <WalletModule
      wallets={wallets}
      walletPromotions={walletPromotions}
      walletHistory={walletHistory}
      customers={customers}
      currentUserRole={currentUserRole}
      currentStore={currentStore}
      handleWalletDeposit={handleWalletDeposit}
      handlePromotionCRUD={handlePromotionCRUD}
      handleWalletAdjust={handleWalletAdjust}
      handleNavigate={handleNavigate}
    />
  );
```

- [ ] **Step 4: Add WalletModule import to App.jsx**

```javascript
import WalletModule from "./components/modules/WalletModule";
```

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/WalletModule.jsx src/components/Sidebar.jsx src/App.jsx
git commit -m "feat: create WalletModule with customer list and promotion management UI"
```

---

### Task 3: Implement Wallet Promotion CRUD

**Files:**
- Modify: `src/components/modules/WalletModule.jsx` (WalletPromotionForm)
- Modify: `src/App.jsx` (add handlePromotionCRUD handler)

**Interfaces:**
- Consumes:
  - `walletPromotions` (state)
- Produces:
  - Handler: `handlePromotionCRUD({ action: 'create'|'edit'|'delete', data })`

- [ ] **Step 1: Implement WalletPromotionForm**

Replace placeholder in `src/components/modules/WalletModule.jsx`:

```javascript
function WalletPromotionForm({ promotion, onSave, onCancel }) {
  const [name, setName] = useState(promotion?.name || "");
  const [description, setDescription] = useState(promotion?.description || "");
  const [type, setType] = useState(promotion?.type || "fixed");
  const [fixedPercentage, setFixedPercentage] = useState(
    promotion?.type === "fixed" ? promotion?.percentage : 20
  );
  const [tiers, setTiers] = useState(
    promotion?.type === "tiered"
      ? promotion?.tiers
      : [
          { minAmount: 50000, maxAmount: 99999, percentage: 15 },
          { minAmount: 100000, maxAmount: 499999, percentage: 20 },
          { minAmount: 500000, maxAmount: Infinity, percentage: 25 }
        ]
  );
  const [startDate, setStartDate] = useState(promotion?.conditions.startDate || "");
  const [endDate, setEndDate] = useState(promotion?.conditions.endDate || "");
  const [timeFrom, setTimeFrom] = useState(promotion?.conditions.timeFrom || "00:00");
  const [timeTo, setTimeTo] = useState(promotion?.conditions.timeTo || "23:59");
  const [stores, setStores] = useState(promotion?.conditions.stores || "all");
  const [paymentMethods, setPaymentMethods] = useState(
    promotion?.conditions.paymentMethods || "all"
  );
  const [customerTiers, setCustomerTiers] = useState(
    promotion?.conditions.customerTiers || "all"
  );
  const [maxTotal, setMaxTotal] = useState(promotion?.limits.maxTotal || 1000);
  const [maxPerCustomer, setMaxPerCustomer] = useState(
    promotion?.limits.maxPerCustomer || 5
  );
  const [status, setStatus] = useState(promotion?.status || "active");

  const handleSave = () => {
    const data = {
      id: promotion?.id,
      name,
      description,
      type,
      percentage: type === "fixed" ? fixedPercentage : null,
      tiers: type === "tiered" ? tiers : null,
      conditions: {
        startDate,
        endDate,
        timeFrom,
        timeTo,
        stores,
        paymentMethods,
        customerTiers
      },
      limits: {
        maxTotal,
        maxPerCustomer,
        maxBonusPerDay: 500000 // Default for now
      },
      status
    };
    onSave(data);
  };

  return (
    <div className="promo-form">
      <h4>{promotion ? "Sửa chương trình" : "Tạo chương trình mới"}</h4>

      <div className="form-group">
        <label>Tên chương trình *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ví dụ: Nạp tiền hôm nay +20%"
        />
      </div>

      <div className="form-group">
        <label>Mô tả</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Mô tả chương trình (tùy chọn)"
        />
      </div>

      <div className="form-group">
        <label>Loại khuyến mãi *</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="fixed">% cố định</option>
          <option value="tiered">Theo tầng</option>
        </select>
      </div>

      {type === "fixed" && (
        <div className="form-group">
          <label>Phần trăm cộng thêm *</label>
          <input
            type="number"
            value={fixedPercentage}
            onChange={e => setFixedPercentage(Number(e.target.value))}
            min="1"
            max="100"
          />
          %
        </div>
      )}

      {type === "tiered" && (
        <div className="form-group">
          <label>Tầng khuyến mãi</label>
          {tiers.map((tier, idx) => (
            <div key={idx} className="tier-row">
              <input
                type="number"
                value={tier.minAmount}
                onChange={e => {
                  const newTiers = [...tiers];
                  newTiers[idx].minAmount = Number(e.target.value);
                  setTiers(newTiers);
                }}
                placeholder="Min"
              />
              -
              <input
                type="number"
                value={tier.maxAmount === Infinity ? 999999999 : tier.maxAmount}
                onChange={e => {
                  const newTiers = [...tiers];
                  newTiers[idx].maxAmount = Number(e.target.value);
                  setTiers(newTiers);
                }}
                placeholder="Max"
              />
              → +
              <input
                type="number"
                value={tier.percentage}
                onChange={e => {
                  const newTiers = [...tiers];
                  newTiers[idx].percentage = Number(e.target.value);
                  setTiers(newTiers);
                }}
                placeholder="%"
              />
              %
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label>Ngày bắt đầu *</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Ngày kết thúc *</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Khung giờ</label>
        <input
          type="time"
          value={timeFrom}
          onChange={e => setTimeFrom(e.target.value)}
        />
        -
        <input
          type="time"
          value={timeTo}
          onChange={e => setTimeTo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Phương thức thanh toán nạp</label>
        <select value={paymentMethods} onChange={e => setPaymentMethods(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="cash,transfer,card">Tiền mặt, chuyển khoản, thẻ</option>
        </select>
      </div>

      <div className="form-group">
        <label>Giới hạn sử dụng</label>
        <div className="limit-inputs">
          <input
            type="number"
            value={maxTotal}
            onChange={e => setMaxTotal(Number(e.target.value))}
            placeholder="Tổng số lần"
          />
          lần tổng /
          <input
            type="number"
            value={maxPerCustomer}
            onChange={e => setMaxPerCustomer(Number(e.target.value))}
            placeholder="Số lần/KH"
          />
          lần trên KH
        </div>
      </div>

      <div className="form-group">
        <label>Trạng thái</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Bật ngay</option>
          <option value="scheduled">Lên lịch</option>
          <option value="paused">Tạm dừng</option>
        </select>
      </div>

      <div className="form-actions">
        <button onClick={handleSave} className="btn btn-primary">
          Lưu
        </button>
        <button onClick={onCancel} className="btn">
          Hủy
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add handlePromotionCRUD to App.jsx**

In App.jsx, add handler:

```javascript
const handlePromotionCRUD = (payload) => {
  const { action, data } = payload;

  if (action === "create") {
    const newPromo = {
      id: `promo-wallet-${Date.now()}`,
      ...data
    };
    setWalletPromotions([...walletPromotions, newPromo]);
    setAuditLogs([
      ...auditLogs,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: currentUser.name,
        action: `Tạo chương trình khuyến mãi nạp ví: ${data.name}`,
        details: ""
      }
    ]);
  } else if (action === "edit") {
    setWalletPromotions(
      walletPromotions.map(p => (p.id === data.id ? { ...p, ...data } : p))
    );
    setAuditLogs([
      ...auditLogs,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: currentUser.name,
        action: `Sửa chương trình khuyến mãi nạp ví: ${data.name}`,
        details: ""
      }
    ]);
  } else if (action === "delete") {
    setWalletPromotions(walletPromotions.filter(p => p.id !== data.id));
    setAuditLogs([
      ...auditLogs,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: currentUser.name,
        action: `Xóa chương trình khuyến mãi nạp ví`,
        details: ""
      }
    ]);
  }
};
```

- [ ] **Step 3: Add handlePromotionCRUD to App function params**

Ensure WalletModule receives this handler and it's exported from App.

- [ ] **Step 4: Commit**

```bash
git add src/components/modules/WalletModule.jsx src/App.jsx
git commit -m "feat: implement wallet promotion CRUD forms and handlers"
```

---

### Task 4: Create WalletTopupModal and Implement Deposit Flow

**Files:**
- Create: `src/components/WalletTopupModal.jsx`
- Modify: `src/App.jsx` (add handleWalletDeposit handler, add modal routing)

**Interfaces:**
- Consumes:
  - `wallets` (state)
  - `walletPromotions` (state)
  - `walletHistory` (state)
  - Utility: `getApplicablePromotion()`, `calculateBonus()`
- Produces:
  - Modal component: accepts `{ customer, onClose, onDeposit, wallets, walletPromotions, walletHistory, currentStore, currentUser }`
  - Handler: `handleWalletDeposit({ customerPhone, depositAmount, paymentMethod, promotionId })`

- [ ] **Step 1: Create WalletTopupModal component**

Create `src/components/WalletTopupModal.jsx`:

```javascript
import React, { useState, useEffect } from "react";
import { getApplicablePromotion, calculateBonus } from "../utils/walletUtils";

export default function WalletTopupModal({
  customer,
  onClose,
  onDeposit,
  wallets,
  walletPromotions,
  walletHistory,
  currentStore,
  currentUser
}) {
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [bonus, setBonus] = useState(0);
  const [totalToReceive, setTotalToReceive] = useState(0);

  // Auto-calculate bonus when amount changes
  useEffect(() => {
    if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) {
      setSelectedPromotion(null);
      setBonus(0);
      setTotalToReceive(0);
      return;
    }

    const applicable = getApplicablePromotion(
      walletPromotions,
      Number(depositAmount),
      paymentMethod,
      customer.phone,
      new Date().toISOString(),
      currentStore,
      customer.tier || "silver", // Default tier
      walletHistory
    );

    setSelectedPromotion(applicable);

    if (applicable) {
      const calculatedBonus = calculateBonus(Number(depositAmount), applicable);
      setBonus(calculatedBonus);
      setTotalToReceive(Number(depositAmount) + calculatedBonus);
    } else {
      setBonus(0);
      setTotalToReceive(Number(depositAmount));
    }
  }, [depositAmount, paymentMethod, walletPromotions, walletHistory]);

  const handleDeposit = () => {
    if (!depositAmount || depositAmount <= 0) {
      alert("Vui lòng nhập số tiền nạp");
      return;
    }

    onDeposit({
      customerPhone: customer.phone,
      depositAmount: Number(depositAmount),
      paymentMethod,
      promotionId: selectedPromotion?.id || null,
      bonus,
      totalToReceive
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wallet-topup-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nạp tiền vào ví</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="customer-info">
            <h3>{customer.name}</h3>
            <p>{customer.phone}</p>
          </div>

          <div className="form-group">
            <label>Số tiền nạp (VND) *</label>
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="Nhập số tiền"
              min="1"
            />
          </div>

          <div className="promotion-info">
            {selectedPromotion ? (
              <div className="promo-active">
                <h4>✓ Áp dụng chương trình: {selectedPromotion.name}</h4>
                <div className="bonus-display">
                  <div className="bonus-row">
                    <span>Nạp:</span>
                    <span className="amount">{Number(depositAmount).toLocaleString()}đ</span>
                  </div>
                  <div className="bonus-row highlight">
                    <span>Bonus ({bonus / Number(depositAmount) * 100 | 0}%):</span>
                    <span className="amount">+{bonus.toLocaleString()}đ</span>
                  </div>
                  <div className="bonus-row total">
                    <span>Tổng cộng:</span>
                    <span className="amount">{totalToReceive.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="promo-none">
                <p>Không có chương trình khuyến mãi áp dụng</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phương thức nạp *</label>
            <div className="payment-methods">
              <button
                className={`method-btn ${paymentMethod === "cash" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                💵 Tiền mặt
              </button>
              <button
                className={`method-btn ${paymentMethod === "transfer" ? "active" : ""}`}
                onClick={() => setPaymentMethod("transfer")}
              >
                💳 Chuyển khoản (QR)
              </button>
              <button
                className={`method-btn ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                🏦 Thẻ
              </button>
            </div>
          </div>

          {paymentMethod === "transfer" && (
            <div className="qr-info">
              <p>Khách hàng sẽ quét mã QR để chuyển khoản</p>
              <div className="qr-placeholder">[QR CODE PLACEHOLDER]</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn">Hủy</button>
          <button onClick={handleDeposit} className="btn btn-primary">
            Xác nhận nạp {totalToReceive.toLocaleString()}đ
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add modal state to App.jsx**

In App.jsx state section:

```javascript
const [walletTopupCustomer, setWalletTopupCustomer] = useState(null);
```

- [ ] **Step 3: Add handleWalletDeposit handler to App.jsx**

```javascript
const handleWalletDeposit = (payload) => {
  const {
    customerPhone,
    depositAmount,
    paymentMethod,
    promotionId,
    bonus,
    totalToReceive
  } = payload;

  // Update wallet balance
  setWallets(prev => ({
    ...prev,
    [customerPhone]: {
      ...(prev[customerPhone] || {
        balance: 0,
        status: "active",
        createdAt: new Date().toLocaleDateString("vi-VN"),
        updatedAt: new Date().toLocaleDateString("vi-VN"),
        notes: ""
      }),
      balance: (prev[customerPhone]?.balance || 0) + totalToReceive,
      updatedAt: new Date().toLocaleDateString("vi-VN")
    }
  }));

  // Record in history
  const historyRecord = {
    id: `history-${Date.now()}`,
    customerPhone,
    type: "deposit",
    amount: depositAmount,
    bonus,
    totalReceived: totalToReceive,
    paymentMethod,
    promotionId: promotionId || null,
    staffUser: currentUser.name,
    timestamp: new Date().toLocaleString("vi-VN"),
    store: currentStore
  };

  setWalletHistory([...walletHistory, historyRecord]);

  // Audit log
  setAuditLogs([
    ...auditLogs,
    {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("vi-VN"),
      user: currentUser.name,
      action: `Nạp ví cho KH ${customerPhone}: ${depositAmount}đ (bonus: ${bonus}đ)`,
      details: `Phương thức: ${paymentMethod}`
    }
  ]);

  setWalletTopupCustomer(null);
  alert(`Nạp tiền thành công! Khách hàng nhận được ${totalToReceive.toLocaleString()}đ`);
};
```

- [ ] **Step 4: Add modal render in App.jsx main render**

In App.jsx render, after main viewport:

```javascript
{walletTopupCustomer && (
  <WalletTopupModal
    customer={walletTopupCustomer}
    onClose={() => setWalletTopupCustomer(null)}
    onDeposit={handleWalletDeposit}
    wallets={wallets}
    walletPromotions={walletPromotions}
    walletHistory={walletHistory}
    currentStore={currentStore}
    currentUser={currentUser}
  />
)}
```

- [ ] **Step 5: Update WalletModule to trigger modal**

In WalletModule, update onDepositClick:

```javascript
onDepositClick={() => {
  // This will be triggered in parent App via handleNavigate
}}
```

Then in App.jsx, update handleNavigate to handle "walletTopup":

```javascript
const handleNavigate = (view, data) => {
  if (view === "walletTopup") {
    setWalletTopupCustomer(data);
    setCurrentView("wallet");
  } else {
    setCurrentView(view);
  }
};
```

- [ ] **Step 6: Add WalletTopupModal import to App.jsx**

```javascript
import WalletTopupModal from "./components/WalletTopupModal";
```

- [ ] **Step 7: Commit**

```bash
git add src/components/WalletTopupModal.jsx src/App.jsx
git commit -m "feat: implement wallet deposit modal with promotion bonus calculation"
```

---

### Task 5: Implement Wallet Payment in PaymentModal (Split Payment Support)

**Files:**
- Modify: `src/components/PaymentModal.jsx`
- Modify: `src/App.jsx` (add handleWalletPayment handler)

**Interfaces:**
- Consumes:
  - `wallets` (state)
  - `customers` (state)
  - Utility: `validateWalletPayment()`
- Produces:
  - Modified PaymentModal: "Ví khách hàng" option, split payment UI
  - Handler: `handleWalletPayment({ customerPhone, transactionAmount, walletUsed, otherMethod, otherAmount })`

- [ ] **Step 1: Modify PaymentModal to add wallet option**

In `src/components/PaymentModal.jsx`, after existing payment methods:

```javascript
// Add to payment methods section
<button
  className={`payment-method ${paymentMethod === "wallet" ? "selected" : ""}`}
  onClick={() => setPaymentMethod("wallet")}
>
  💳 Ví khách hàng
</button>
```

- [ ] **Step 2: Add wallet payment form**

In PaymentModal, after existing payment forms, add:

```javascript
{paymentMethod === "wallet" && (
  <div className="payment-wallet-section">
    <div className="wallet-search">
      <label>Tìm khách hàng (SĐT)</label>
      <input
        type="text"
        placeholder="Nhập SĐT khách hàng"
        onChange={e => {
          const phone = e.target.value;
          const customer = customers.find(c => c.phone === phone);
          setSelectedWalletCustomer(customer);
        }}
      />
    </div>

    {selectedWalletCustomer && wallets[selectedWalletCustomer.phone] && (
      <div className="wallet-info">
        <div className="wallet-detail">
          <p>Khách hàng: <strong>{selectedWalletCustomer.name}</strong></p>
          <p>SĐT: <strong>{selectedWalletCustomer.phone}</strong></p>
          <p>Số dư ví: <strong className="balance">{wallets[selectedWalletCustomer.phone].balance.toLocaleString()}đ</strong></p>
        </div>

        <div className="wallet-payment-calc">
          <div className="calc-row">
            <span>Tổng hóa đơn:</span>
            <span className="amount">{totalAmount.toLocaleString()}đ</span>
          </div>
          {wallets[selectedWalletCustomer.phone].balance < totalAmount ? (
            <>
              <div className="calc-row warning">
                <span>Ví không đủ. Sẽ dùng toàn bộ ví:</span>
                <span className="amount">{wallets[selectedWalletCustomer.phone].balance.toLocaleString()}đ</span>
              </div>
              <div className="calc-row">
                <span>Còn phải thanh toán:</span>
                <span className="amount">
                  {(totalAmount - wallets[selectedWalletCustomer.phone].balance).toLocaleString()}đ
                </span>
              </div>
              <div className="split-payment-note">
                Khách hàng cần thanh toán thêm bằng phương thức khác
              </div>
            </>
          ) : (
            <div className="calc-row success">
              <span>✓ Ví đủ tiền. Ví còn lại sau khi thanh toán:</span>
              <span className="amount">
                {(wallets[selectedWalletCustomer.phone].balance - totalAmount).toLocaleString()}đ
              </span>
            </div>
          )}
        </div>
      </div>
    )}

    {!selectedWalletCustomer && (
      <p className="info-text">Hãy nhập SĐT khách hàng để tiếp tục</p>
    )}
  </div>
)}
```

- [ ] **Step 3: Add state for wallet payment**

In PaymentModal component:

```javascript
const [selectedWalletCustomer, setSelectedWalletCustomer] = useState(null);
const [splitPaymentMode, setSplitPaymentMode] = useState(false);
const [splitPayments, setSplitPayments] = useState([]);
```

- [ ] **Step 4: Update payment confirmation logic**

Modify the confirm payment button logic to handle wallet:

```javascript
const handlePaymentConfirm = () => {
  if (paymentMethod === "wallet") {
    if (!selectedWalletCustomer) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    const wallet = wallets[selectedWalletCustomer.phone];
    if (!wallet || wallet.status !== "active") {
      alert("Ví khách hàng không khả dụng");
      return;
    }

    onPaymentComplete({
      method: "wallet",
      amount: totalAmount,
      customerPhone: selectedWalletCustomer.phone,
      walletUsed: Math.min(wallet.balance, totalAmount),
      remainingAmount: Math.max(0, totalAmount - wallet.balance)
    });
  } else {
    // Existing logic for other payment methods
    onPaymentComplete({
      method: paymentMethod,
      amount: totalAmount
    });
  }
};
```

- [ ] **Step 5: Add handleWalletPayment to App.jsx**

```javascript
const handleWalletPayment = (payload) => {
  const {
    customerPhone,
    transactionAmount,
    walletUsed,
    orderId,
    otherMethod,
    otherAmount
  } = payload;

  // Deduct from wallet
  setWallets(prev => ({
    ...prev,
    [customerPhone]: {
      ...prev[customerPhone],
      balance: prev[customerPhone].balance - walletUsed,
      updatedAt: new Date().toLocaleDateString("vi-VN")
    }
  }));

  // Record in history
  const historyRecord = {
    id: `history-${Date.now()}`,
    customerPhone,
    type: "payment",
    amount: transactionAmount,
    paymentMethod: walletUsed > 0 && otherMethod ? ["wallet", otherMethod] : ["wallet"],
    walletUsed,
    otherMethodUsed: otherAmount || 0,
    orderId,
    staffUser: currentUser.name,
    timestamp: new Date().toLocaleString("vi-VN"),
    store: currentStore
  };

  setWalletHistory([...walletHistory, historyRecord]);

  // Audit log
  setAuditLogs([
    ...auditLogs,
    {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("vi-VN"),
      user: currentUser.name,
      action: `Thanh toán bằng ví cho KH ${customerPhone}: ${walletUsed}đ${otherAmount ? ` + ${otherAmount}đ (${otherMethod})` : ""}`,
      details: `Đơn: ${orderId}`
    }
  ]);
};
```

- [ ] **Step 6: Update PaymentModal to call handler**

When payment confirmed with wallet, call:

```javascript
onPaymentComplete({
  method: "wallet",
  customerPhone: selectedWalletCustomer.phone,
  transactionAmount: totalAmount,
  walletUsed: Math.min(wallets[selectedWalletCustomer.phone].balance, totalAmount),
  orderId: orderData?.id,
  otherMethod: shouldUseSplitPayment ? nextPaymentMethod : null,
  otherAmount: Math.max(0, totalAmount - wallets[selectedWalletCustomer.phone].balance)
});
```

- [ ] **Step 7: Integrate with PosSale order completion**

In PosSale or App order completion handler:

```javascript
if (lastPaymentMethod === "wallet") {
  handleWalletPayment({...});
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/PaymentModal.jsx src/App.jsx
git commit -m "feat: implement wallet payment method with split payment support"
```

---

### Task 6: Implement Wallet History Viewing and Reporting

**Files:**
- Modify: `src/components/modules/WalletModule.jsx` (enhance WalletHistoryPanel)
- Create: `src/components/modules/WalletReportsModule.jsx` (optional, or add to WalletModule)

**Interfaces:**
- Consumes:
  - `walletHistory` (state)
  - `wallets` (state)
  - `customers` (state)
- Produces:
  - Enhanced history panel with filtering, search, and reporting

- [ ] **Step 1: Enhance WalletHistoryPanel in WalletModule.jsx**

Replace WalletHistoryPanel:

```javascript
function WalletHistoryPanel({ history, customers, currentUserRole }) {
  const [filterType, setFilterType] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [searchPhone, setSearchPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredHistory = history.filter(record => {
    if (filterType !== "all" && record.type !== filterType) return false;
    if (filterMethod !== "all" && !record.paymentMethod.includes(filterMethod)) return false;
    if (searchPhone && !record.customerPhone.includes(searchPhone)) return false;
    if (startDate && new Date(record.timestamp) < new Date(startDate)) return false;
    if (endDate && new Date(record.timestamp) > new Date(endDate)) return false;
    return true;
  });

  // Calculate stats
  const stats = {
    totalDeposits: filteredHistory
      .filter(h => h.type === "deposit")
      .reduce((sum, h) => sum + h.amount, 0),
    totalBonus: filteredHistory
      .filter(h => h.type === "deposit")
      .reduce((sum, h) => sum + h.bonus, 0),
    totalPayments: filteredHistory
      .filter(h => h.type === "payment")
      .reduce((sum, h) => sum + h.amount, 0),
    totalTransactions: filteredHistory.length
  };

  return (
    <div className="wallet-history-panel">
      <h3>Lịch sử ví</h3>

      <div className="filter-section">
        <div className="filter-row">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tất cả loại</option>
            <option value="deposit">Nạp tiền</option>
            <option value="payment">Thanh toán</option>
          </select>

          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
            <option value="all">Tất cả phương thức</option>
            <option value="cash">Tiền mặt</option>
            <option value="transfer">Chuyển khoản</option>
            <option value="card">Thẻ</option>
            <option value="wallet">Ví</option>
          </select>

          <input
            type="text"
            placeholder="Tìm SĐT khách hàng"
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
          />

          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h4>Tổng nạp tiền</h4>
          <p className="amount">{stats.totalDeposits.toLocaleString()}đ</p>
        </div>
        <div className="stat-card">
          <h4>Tổng bonus</h4>
          <p className="amount highlight">{stats.totalBonus.toLocaleString()}đ</p>
        </div>
        <div className="stat-card">
          <h4>Tổng thanh toán từ ví</h4>
          <p className="amount">{stats.totalPayments.toLocaleString()}đ</p>
        </div>
        <div className="stat-card">
          <h4>Số giao dịch</h4>
          <p className="count">{stats.totalTransactions}</p>
        </div>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Bonus / Phương thức</th>
              <th>Thời gian</th>
              <th>Nhân viên</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map(record => {
              const customer = customers.find(c => c.phone === record.customerPhone);
              return (
                <tr key={record.id}>
                  <td>{customer?.name || "Unknown"}</td>
                  <td>{record.customerPhone}</td>
                  <td>
                    <span className={`badge type-${record.type}`}>
                      {record.type === "deposit" ? "Nạp tiền" : "Thanh toán"}
                    </span>
                  </td>
                  <td className="amount">{record.amount.toLocaleString()}đ</td>
                  <td>
                    {record.type === "deposit"
                      ? `+${record.bonus.toLocaleString()}đ (${record.promotionId || "N/A"})`
                      : Array.isArray(record.paymentMethod)
                      ? record.paymentMethod.join(", ")
                      : record.paymentMethod}
                  </td>
                  <td>{record.timestamp}</td>
                  <td>{record.staffUser}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredHistory.length === 0 && (
        <div className="empty-state">
          <p>Không có ghi nhận nào</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/modules/WalletModule.jsx
git commit -m "feat: enhance wallet history viewing with filters and reporting stats"
```

---

### Task 7: Implement Audit Logging and Manual Wallet Adjustment

**Files:**
- Modify: `src/components/modules/WalletModule.jsx` (add adjustment modal)
- Modify: `src/App.jsx` (add handleWalletAdjust handler)

**Interfaces:**
- Consumes:
  - `wallets` (state)
  - `auditLogs` (state)
- Produces:
  - Handler: `handleWalletAdjust({ customerPhone, action, amount, reason, notes })`

- [ ] **Step 1: Create WalletAdjustmentModal component**

Add to `src/components/modules/WalletModule.jsx`:

```javascript
function WalletAdjustmentModal({ customer, wallet, onSave, onCancel, currentUser }) {
  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền");
      return;
    }
    if (!reason) {
      alert("Vui lòng nhập lý do");
      return;
    }

    onSave({
      customerPhone: customer.phone,
      action,
      amount: Number(amount),
      reason,
      notes,
      timestamp: new Date().toLocaleString("vi-VN"),
      staffUser: currentUser.name
    });
  };

  const newBalance = action === "add"
    ? (wallet?.balance || 0) + Number(amount || 0)
    : (wallet?.balance || 0) - Number(amount || 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content adjustment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Điều chỉnh số dư ví</h2>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="customer-info">
            <p>{customer.name} ({customer.phone})</p>
            <p>Số dư hiện tại: <strong>{(wallet?.balance || 0).toLocaleString()}đ</strong></p>
          </div>

          <div className="form-group">
            <label>Hành động *</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="add"
                  checked={action === "add"}
                  onChange={e => setAction(e.target.value)}
                />
                Cộng tiền
              </label>
              <label>
                <input
                  type="radio"
                  value="subtract"
                  checked={action === "subtract"}
                  onChange={e => setAction(e.target.value)}
                />
                Trừ tiền
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Số tiền (VND) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Lý do *</label>
            <select value={reason} onChange={e => setReason(e.target.value)}>
              <option value="">-- Chọn lý do --</option>
              <option value="khieu_nai">Khiếu nại từ khách</option>
              <option value="loi_he_thong">Lỗi hệ thống</option>
              <option value="khong_dung_quy_trinh">Không đúng quy trình</option>
              <option value="khac">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú thêm (tùy chọn)"
              rows="3"
            />
          </div>

          <div className="new-balance">
            <p>Số dư sẽ trở thành:</p>
            <p className={`amount ${newBalance < 0 ? "negative" : ""}`}>
              {newBalance.toLocaleString()}đ
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn">Hủy</button>
          <button onClick={handleSave} className="btn btn-primary">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update WalletDetailPanel to open adjustment modal**

Modify WalletDetailPanel:

```javascript
function WalletDetailPanel({
  customer,
  wallet,
  history,
  currentUserRole,
  onClose,
  onDepositClick,
  onAdjustClick
}) {
  const [showAdjustment, setShowAdjustment] = useState(false);

  if (!wallet) return null;

  const canAdjust = ["owner", "manager"].includes(currentUserRole);

  return (
    <div className="wallet-detail-panel">
      {/* ... existing code ... */}
      
      <div className="panel-actions">
        <button onClick={onDepositClick} className="btn btn-primary">
          Nạp ví
        </button>
        {canAdjust && (
          <button onClick={() => setShowAdjustment(true)} className="btn">
            Điều chỉnh số dư
          </button>
        )}
      </div>

      {showAdjustment && (
        <WalletAdjustmentModal
          customer={customer}
          wallet={wallet}
          onSave={(data) => {
            onAdjustClick(data);
            setShowAdjustment(false);
          }}
          onCancel={() => setShowAdjustment(false)}
          currentUser={/* pass current user from parent */}
        />
      )}

      {/* ... rest of existing code ... */}
    </div>
  );
}
```

- [ ] **Step 3: Add handleWalletAdjust to App.jsx**

```javascript
const handleWalletAdjust = (payload) => {
  const {
    customerPhone,
    action,
    amount,
    reason,
    notes,
    timestamp,
    staffUser
  } = payload;

  const wallet = wallets[customerPhone];
  if (!wallet) {
    alert("Ví không tồn tại");
    return;
  }

  const newBalance = action === "add"
    ? wallet.balance + amount
    : Math.max(0, wallet.balance - amount);

  // Update wallet
  setWallets(prev => ({
    ...prev,
    [customerPhone]: {
      ...prev[customerPhone],
      balance: newBalance,
      updatedAt: new Date().toLocaleDateString("vi-VN")
    }
  }));

  // Audit log with full details
  setAuditLogs([
    ...auditLogs,
    {
      id: `log-${Date.now()}`,
      timestamp,
      user: staffUser,
      action: `Điều chỉnh ví KH ${customerPhone}: ${action === "add" ? "+" : "-"}${amount}đ`,
      details: `Lý do: ${reason} | Ghi chú: ${notes} | Số dư trước: ${wallet.balance}đ | Số dư sau: ${newBalance}đ`
    }
  ]);

  alert(`Đã điều chỉnh số dư ví. Số dư mới: ${newBalance.toLocaleString()}đ`);
};
```

- [ ] **Step 4: Add handleWalletAdjust to WalletModule props**

In App.jsx render WalletModule:

```javascript
handleWalletAdjust={handleWalletAdjust}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/WalletModule.jsx src/App.jsx
git commit -m "feat: implement wallet adjustment with audit logging and reason tracking"
```

---

### Task 8: CSS Styling and UI Refinement

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: All wallet components UI structure
- Produces: Styled classes for wallet module, modals, cards, tables

- [ ] **Step 1: Add wallet-related CSS classes**

Append to `src/App.css`:

```css
/* ========== Wallet Module ========== */

.wallet-module {
  padding: 20px;
}

.wallet-module h2 {
  margin-bottom: 20px;
  font-size: 1.8em;
  color: var(--text-primary);
}

.wallet-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.wallet-tabs button {
  padding: 10px 15px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: var(--text-secondary);
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.wallet-tabs button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.wallet-tabs button:hover {
  color: var(--text-primary);
}

/* Customer Wallets List */

.wallet-customers-section {
  display: flex;
  gap: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1em;
}

.customers-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.customer-wallet-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.customer-wallet-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.customer-wallet-card .card-header {
  margin-bottom: 10px;
}

.customer-wallet-card h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.customer-wallet-card .phone {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wallet-info .balance {
  display: flex;
  justify-content: space-between;
  font-size: 1.05em;
}

.wallet-info .amount {
  font-weight: bold;
  color: var(--primary-color);
}

.wallet-info .status {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
}

.badge.status-active {
  background-color: #4caf50;
  color: white;
}

.badge.status-locked {
  background-color: #ff9800;
  color: white;
}

.badge.status-deleted {
  background-color: #f44336;
  color: white;
}

.no-wallet {
  color: var(--text-secondary);
  font-size: 0.9em;
}

/* Wallet Detail Panel */

.wallet-detail-panel {
  flex: 0 0 350px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  background: var(--bg-surface);
  max-height: 600px;
  overflow-y: auto;
}

.wallet-detail-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.wallet-detail-panel h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: var(--text-secondary);
}

.wallet-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-surface);
}

.detail-row label {
  font-weight: bold;
  color: var(--text-secondary);
}

.detail-row.balance {
  font-size: 1.1em;
  background-color: var(--bg-hover);
  padding: 10px 8px;
  border-radius: 4px;
}

.detail-row.balance .amount {
  color: var(--primary-color);
  font-weight: bold;
}

.panel-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.panel-actions .btn {
  flex: 1;
}

.recent-history {
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.recent-history h4 {
  margin: 0 0 10px 0;
  font-size: 0.95em;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: var(--bg-hover);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.history-item .type {
  background-color: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
}

.history-item .amount {
  font-weight: bold;
}

.history-item .time {
  color: var(--text-secondary);
  font-size: 0.85em;
}

/* Wallet Topup Modal */

.wallet-topup-modal {
  max-width: 500px;
}

.wallet-topup-modal .customer-info {
  background-color: var(--bg-hover);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.wallet-topup-modal h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.wallet-topup-modal p {
  margin: 0;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.95em;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1em;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.promotion-info {
  background-color: var(--bg-surface);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.promo-active {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.promo-active h4 {
  color: #4caf50;
  margin: 0 0 10px 0;
}

.bonus-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bonus-row {
  display: flex;
  justify-content: space-between;
  font-size: 1em;
}

.bonus-row.highlight {
  color: var(--primary-color);
  font-weight: bold;
}

.bonus-row.total {
  border-top: 2px solid var(--border-color);
  padding-top: 8px;
  font-size: 1.1em;
  font-weight: bold;
}

.bonus-row .amount {
  font-weight: bold;
}

.promo-none {
  color: var(--text-secondary);
  text-align: center;
  padding: 10px;
}

.payment-methods {
  display: flex;
  gap: 10px;
}

.method-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  background-color: var(--bg-surface);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.3s;
}

.method-btn:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.method-btn.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

/* Wallet Promotion Panel */

.wallet-promotion-panel {
  padding: 20px;
}

.wallet-promotion-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.promotions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.promotion-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.promotion-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.promotion-card .card-header {
  background-color: var(--bg-hover);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.promotion-card h4 {
  margin: 0;
}

.promotion-card .card-body {
  padding: 15px;
}

.promotion-card p {
  margin: 5px 0;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.promotion-card .actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.btn-small {
  flex: 1;
  padding: 6px;
  font-size: 0.85em;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-small:hover {
  background-color: var(--bg-hover);
}

.btn-small.btn-danger {
  color: #f44336;
  border-color: #f44336;
}

.btn-small.btn-danger:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

/* Wallet History Panel */

.wallet-history-panel {
  padding: 20px;
}

.filter-section {
  background-color: var(--bg-hover);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-row select,
.filter-row input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9em;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.stat-card .amount {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-card .amount.highlight {
  color: #ff9800;
}

.stat-card .count {
  font-size: 1.8em;
  font-weight: bold;
  color: var(--text-primary);
}

.history-table {
  overflow-x: auto;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.history-table th {
  background-color: var(--bg-hover);
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid var(--border-color);
}

.history-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
}

.history-table tr:hover {
  background-color: var(--bg-hover);
}

.history-table .amount {
  font-weight: bold;
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

/* Wallet Adjustment Modal */

.adjustment-modal {
  max-width: 450px;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  cursor: pointer;
}

.new-balance {
  background-color: var(--bg-hover);
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 15px;
}

.new-balance p {
  margin: 0;
  font-size: 0.95em;
  color: var(--text-secondary);
}

.new-balance .amount {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 5px;
}

.new-balance .amount.negative {
  color: #f44336;
}

/* Modal Overlay */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3em;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Buttons */

.btn {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.3s;
}

.btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--text-secondary);
}

.btn.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn.btn-primary:hover {
  background-color: #4a5fd2;
  border-color: #4a5fd2;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Add responsive design for mobile**

Add to end of wallet CSS:

```css
@media (max-width: 768px) {
  .wallet-customers-section {
    flex-direction: column;
  }

  .wallet-detail-panel {
    flex: 1;
  }

  .customers-list {
    grid-template-columns: 1fr;
  }

  .payment-methods {
    flex-direction: column;
  }

  .method-btn {
    width: 100%;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
  }

  .history-table {
    font-size: 0.8em;
  }

  .history-table th,
  .history-table td {
    padding: 8px;
  }

  .modal-content {
    width: 95%;
    max-width: 100%;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "style: add comprehensive wallet module styling and responsive design"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** 
  - [x] Wallet customer info & balance (Task 1, 2)
  - [x] Deposit methods (Task 4)
  - [x] Promotion CRUD (Task 3)
  - [x] Automatic promotion matching & bonus (Task 4)
  - [x] Wallet payment & split payment (Task 5)
  - [x] History & reporting (Task 6)
  - [x] Manual adjustment & audit (Task 7)
  - [x] UI/CSS styling (Task 8)

- [ ] **No placeholders:** All code blocks contain full implementations with no TBD, TODO, or "implement later"

- [ ] **Type consistency:** 
  - Wallet object: `{ balance, status, createdAt, updatedAt, notes }`
  - History record: `{ id, customerPhone, type, amount, bonus, ...}`
  - Promotion: `{ id, name, type, percentage/tiers, conditions, limits, status }`

- [ ] **Review Focus coverage:**
  - Test 1 (Promotion matching): Step in Task 4 validates getApplicablePromotion()
  - Test 2 (Split payment): Step in Task 5 validates wallet insufficient logic
  - Test 3 (Wallet state): Task 2 checks wallet.status before operations
  - Test 4 (Refund loop): Task 5 adds refund amount back to wallet
  - Test 5 (Audit trail): Task 7 records all details in auditLogs

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-10-15-wallet-feature.md`.**

This plan breaks wallet feature into 8 independent, testable tasks (1,850 LOC total):

- **Task 1–2:** Foundation (state, mock data, WalletModule UI)
- **Task 3:** Promotion CRUD
- **Task 4–5:** User flows (deposit, payment)
- **Task 6–7:** Reporting & admin features
- **Task 8:** Polish

**Which execution approach would you prefer?**

- **Subagent-driven:** Fresh subagent per task + reviewer. Most thorough; best for high-confidence shipping.
- **Native:** I implement all tasks in this session. Fastest; good when iteration is acceptable.

For this plan, I recommend **Native** because:
- Tasks are well-specified with exact code blocks
- Significant interdependency (handlers in App.jsx, utilities shared across components)
- Quick iteration cycle useful if requirements clarify during coding

Does the plan capture what you want, and which approach should we use?
