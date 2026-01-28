/**
 * Restaurant Chatbot Frontend
 * Handles chat interactions, order management, and payment integration
 */

class RestaurantChatbot {
  constructor() {
    this.chatMessages = document.getElementById("chatMessages");
    this.messageInput = document.getElementById("messageInput");
    this.sendButton = document.getElementById("sendButton");
    this.orderItems = document.getElementById("orderItems");
    this.totalAmount = document.getElementById("totalAmount");
    this.clearOrderBtn = document.getElementById("clearOrderBtn");
    this.paymentModal = document.getElementById("paymentModal");
    this.closeModal = document.getElementById("closeModal");
    this.proceedPaymentBtn = document.getElementById("proceedPaymentBtn");
    this.cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
    this.recentOrdersList = document.getElementById("recentOrdersList");
    this.loadingIndicator = document.getElementById("loadingIndicator");

    this.currentOrder = [];
    this.orderHistory = [];
    this.awaitingPayment = false;
    this.currentPaymentAmount = 0;

    this.initializeEventListeners();
    this.initializeChat();
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    this.sendButton.addEventListener("click", () => this.handleSendMessage());
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSendMessage();
    });
    this.clearOrderBtn.addEventListener("click", () => this.clearOrder());
    this.closeModal.addEventListener("click", () => this.closePaymentModal());
    this.cancelPaymentBtn.addEventListener("click", () =>
      this.closePaymentModal(),
    );
    this.proceedPaymentBtn.addEventListener("click", () =>
      this.proceedToPayment(),
    );
  }

  /**
   * Initialize chat by fetching welcome message
   */
  async initializeChat() {
    try {
      const response = await fetch("/api/chat/init");
      const data = await response.json();
      this.displayBotMessage(data.reply);
      this.messageInput.focus();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      this.displayBotMessage(
        "Failed to initialize chat. Please refresh the page.",
      );
    }
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage() {
    const message = this.messageInput.value.trim();

    if (!message) return;

    // Display user message
    this.displayUserMessage(message);
    this.messageInput.value = "";
    this.messageInput.disabled = true;
    this.sendButton.disabled = true;
    this.showLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      this.displayBotMessage(data.reply);

      // Update UI based on response
      if (data.currentOrder) {
        this.currentOrder = data.currentOrder;
        this.updateOrderDisplay();
      }

      if (data.orderHistory) {
        this.orderHistory = data.orderHistory;
        this.updateOrderHistory();
      }

      // Handle payment flow
      if (data.reply.includes("Order placed successfully")) {
        this.extractPaymentAmount();
        this.awaitingPayment = true;
      }

      // Handle payment redirect
      if (data.paymentUrl) {
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
      this.displayBotMessage(
        "Sorry, an error occurred. Please try again later.",
      );
    } finally {
      this.showLoading(false);
      this.messageInput.disabled = false;
      this.sendButton.disabled = false;
      this.messageInput.focus();
    }
  }

  /**
   * Display bot message
   */
  displayBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";
    messageDiv.innerHTML = `
      <span class="avatar">🤖</span>
      <div class="message-content">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
    this.chatMessages.appendChild(messageDiv);
    // Use setTimeout to ensure scrolling happens after DOM update
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 10);
  }

  /**
   * Display user message
   */
  displayUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
    this.chatMessages.appendChild(messageDiv);
    // Use setTimeout to ensure scrolling happens after DOM update
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 10);
  }

  /**
   * Update order display in sidebar
   */
  updateOrderDisplay() {
    if (this.currentOrder.length === 0) {
      this.orderItems.innerHTML =
        '<p class="empty-state">No items added yet</p>';
      this.clearOrderBtn.style.display = "none";
      this.totalAmount.textContent = "₦0";
      return;
    }

    let total = 0;
    const itemsHTML = this.currentOrder
      .map((item) => {
        const parts = item.split(" - ₦");
        const price = parseInt(parts[1]) || 0;
        total += price;
        return `
        <div class="order-item">
          <span class="item-name">${this.escapeHtml(parts[0])}</span>
          <span class="item-price">₦${price}</span>
        </div>
      `;
      })
      .join("");

    this.orderItems.innerHTML = itemsHTML;
    this.totalAmount.textContent = `₦${total}`;
    this.currentPaymentAmount = total;
    this.clearOrderBtn.style.display = "block";
  }

  /**
   * Update order history in sidebar
   */
  updateOrderHistory() {
    if (this.orderHistory.length === 0) {
      this.recentOrdersList.innerHTML =
        '<p class="empty-state">No orders placed yet</p>';
      return;
    }

    const itemsHTML = this.orderHistory
      .slice(-3) // Show last 3 orders
      .map((order, index) => {
        const orderNum = this.orderHistory.length - 2 + index;
        return `
        <div class="recent-order-item">
          <span class="order-index">Order ${orderNum}</span>
          <p style="margin-top: 4px; color: #666;">${order.length} items</p>
        </div>
      `;
      })
      .join("");

    this.recentOrdersList.innerHTML = itemsHTML;
  }

  /**
   * Extract payment amount from bot message
   */
  extractPaymentAmount() {
    // This would be handled by the bot response
    // For now, we use the amount already calculated from currentOrder
  }

  /**
   * Open payment modal
   */
  openPaymentModal() {
    const paymentInfo = document.getElementById("paymentInfo");
    paymentInfo.innerHTML = `
      <p><strong>Amount to Pay:</strong> ₦${this.currentPaymentAmount}</p>
      <p><strong>Payment Method:</strong> Paystack</p>
      <p style="font-size: 12px; color: #666; margin-top: 10px;">
        Click the button below to proceed to our secure payment gateway.
      </p>
    `;
    this.paymentModal.style.display = "flex";
  }

  /**
   * Close payment modal
   */
  closePaymentModal() {
    this.paymentModal.style.display = "none";
  }

  /**
   * Proceed to Paystack payment
   */
  async proceedToPayment() {
    this.showLoading(true);

    try {
      const response = await fetch("/api/chat/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: this.currentPaymentAmount,
          email: "customer@restaurant.com", // In real app, get from user
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.paymentUrl;
      } else {
        this.displayBotMessage(
          "Payment initialization failed. Please try again.",
        );
        this.closePaymentModal();
      }
    } catch (error) {
      console.error("Error:", error);
      this.displayBotMessage("Error initializing payment. Please try again.");
      this.closePaymentModal();
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Clear order
   */
  clearOrder() {
    this.currentOrder = [];
    this.updateOrderDisplay();
    this.displayBotMessage(
      "Your order has been cleared. Would you like to place a new order?\nSelect 1 to start.",
    );
  }

  /**
   * Show/hide loading indicator
   */
  showLoading(show) {
    this.loadingIndicator.style.display = show ? "flex" : "none";
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new RestaurantChatbot();
});
