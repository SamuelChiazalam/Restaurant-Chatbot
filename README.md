# 🍽️ Restaurant Chatbot

A sophisticated restaurant ordering chatbot application built with Node.js, Express, and TypeScript. Customers can place orders, view order history, and make payments using Paystack.

## ✨ Features

- **Chat Interface**: Interactive chat-based ordering system with a user-friendly interface
- **Session Management**: Device-based session tracking without authentication
- **Menu Management**: Extensive menu with 12+ food items
- **Order Management**:
  - View current order
  - View order history
  - Cancel orders
  - Calculate order totals automatically
- **Payment Integration**: Secure payment processing with Paystack
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Input Validation**: Comprehensive validation for all user inputs
- **Real-time UI Updates**: Order summary and recent orders displayed in sidebar

## 📋 Requirements Compliance

✅ ChatBot interface with chat-like UI
✅ Session-based user tracking (no authentication required)
✅ Menu system with numbered options (1-99)
✅ Item selection and order placement
✅ Order checkout with payment
✅ Order history tracking
✅ Current order viewing
✅ Order cancellation
✅ Paystack payment integration
✅ Payment verification and success notification
✅ Input validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Session Management**: express-session
- **Payment**: Paystack API
- **HTTP Client**: Axios

## 📦 Installation

### Prerequisites

- Node.js 14+ and npm
- Paystack account (for payment processing)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resturant-chatbot-test
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=7000
   NODE_ENV=development
   SESSION_SECRET=your-secret-key-here
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   ```

   **Get Paystack Keys**:
   - Visit [Paystack Dashboard](https://dashboard.paystack.com/)
   - Go to Settings → API Keys
   - Use the test keys for development

4. **Build TypeScript**

   ```bash
   npm run build
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to: `http://localhost:7000`

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Starts the server with hot-reload using ts-node-dev.

### Production Build

```bash
npm run build
npm start
```

Builds TypeScript and starts the compiled JavaScript.

## 📱 Usage Guide

### Main Menu Options

When you first load the chatbot, select from these options:

- **1** - Place an order
- **99** - Checkout order
- **98** - View order history
- **97** - View current order
- **0** - Cancel order

### Placing an Order

1. Select **1** to view the menu
2. Enter the item number to add items to your order
3. Continue adding items or select **99** to checkout

### Checkout Process

1. Select **99** to checkout
2. View your order summary
3. Click "Pay with Paystack" to process payment
4. Complete payment on Paystack secure page
5. Receive confirmation upon successful payment

### Viewing Orders

- Select **97** to view your current order
- Select **98** to view all previously placed orders

## 📂 Project Structure

```
resturant-chatbot-test/
├── public/
│   ├── css/
│   │   └── style.css           # Styling
│   ├── js/
│   │   └── chat.js             # Frontend logic
│   └── index.html              # Main HTML file
├── src/
│   ├── routes/
│   │   └── chat.ts             # Chat routes and endpoints
│   ├── services/
│   │   ├── bot.ts              # Bot business logic
│   │   └── payment.ts          # Payment service
│   ├── data/
│   │   └── menu.ts             # Menu items
│   ├── types/
│   │   ├── session.ts          # Session type definitions
│   │   └── index.ts            # General types
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🔌 API Endpoints

### Chat Endpoints

**GET** `/api/chat/init`

- Initialize chat session
- Returns: Welcome message and menu options

**POST** `/api/chat`

- Send a chat message
- Body: `{ "message": "1" }`
- Returns: Bot response with order updates

**POST** `/api/chat/payment/initialize`

- Initialize payment transaction
- Body: `{ "amount": 5000, "email": "customer@example.com" }`
- Returns: Payment URL for Paystack

**POST** `/api/chat/payment/verify`

- Verify payment completion
- Body: `{ "reference": "ORDER_ABC123" }`
- Returns: Payment verification status

## 💳 Payment Integration

### Paystack Setup

1. Create a [Paystack account](https://paystack.com/)
2. Verify your account
3. Obtain API keys from the dashboard
4. Add keys to `.env` file

### Payment Flow

1. User places order and selects checkout
2. Bot prepares order and calculates total
3. User initiates payment
4. Frontend sends payment request to backend
5. Backend initializes Paystack transaction
6. User completes payment on Paystack
7. Paystack redirects back to application
8. Backend verifies payment status
9. Order is confirmed in user's history

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with gradient backgrounds
- **Order Summary Sidebar**: Real-time order tracking
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: Fade-in effects for messages
- **Status Indicators**: Visual feedback for payment and order states
- **Loading States**: Visual indicators during processing
- **Mobile Optimized**: Touch-friendly buttons and spacing

## ✅ Validation

The application includes comprehensive input validation:

- Numeric input validation for menu options
- Order amount validation
- Email format validation (optional)
- Session integrity checks
- Payment reference validation

## 🔒 Security Features

- **Session Security**: Secure session cookies with HTTP-only flag
- **CORS Protection**: Enabled for cross-origin requests
- **Input Sanitization**: HTML escaping to prevent XSS attacks
- **Environment Variables**: Sensitive data in .env file
- **HTTPS Ready**: Configuration for production HTTPS

## 📊 Data Persistence

- **Session-Based Storage**: Orders and history stored in user sessions
- **Device-Based Tracking**: No user authentication required
- **24-Hour Session**: Sessions persist for 24 hours
- **Automatic Cleanup**: Sessions expire and are cleaned up automatically

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env file or use different port
PORT=8000 npm run dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Rebuild TypeScript
npm run build
```

### Paystack Payment Issues

- Verify API keys are correct in `.env`
- Ensure you're using test keys for development
- Check internet connectivity
- Verify Paystack account is activated

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Order scheduling feature
- [ ] Email order confirmation
- [ ] Multiple delivery options
- [ ] Promo codes and discounts
- [ ] Order tracking
- [ ] AI-powered recommendations
- [ ] Admin dashboard
- [ ] Database integration (MongoDB)
- [ ] Rate limiting and API throttling

## 📝 Code Documentation

All functions are documented with JSDoc comments:

```typescript
/**
 * Detailed function description
 * @param paramName - Parameter description
 * @returns Return value description
 */
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Samuel Chiazalam Ugbo

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

## 🎯 Submission Details

- **Course**: AltSchool Backend Engineering Baraka 2025 - Third Semester
- **Module**: BEN 523
- **Assessment**: 3
- **Deadline**: 28th January, 2026

---

**Happy Ordering! 🍽️** 🎉
