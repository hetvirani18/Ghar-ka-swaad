# 🍽️ Ghar Se Swaad (Home Taste)

![Ghar Se Swaad Logo](public/logo.jpg)

A modern food delivery platform connecting home cooks with food lovers, bringing authentic homemade meals right to your doorstep.

![Ghar Se Swaad](https://img.shields.io/badge/Ghar%20Se%20Swaad-Food%20Delivery-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5+-47A248?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)

## 🌟 Features

### For Customers
- **Browse Local Cooks**: Discover home cooks in your neighborhood
- **Diverse Menu**: Explore authentic homemade meals with detailed descriptions
- **Easy Ordering**: Seamless cart and checkout experience
- **Real-time Tracking**: Track your order status
- **Secure Payments**: Multiple payment options including UPI
- **Ratings & Reviews**: Rate meals and build trust in the community

### For Home Cooks
- **Easy Registration**: Simple process to become a cook on the platform
- **Menu Management**: Add, update, and manage your meal offerings
- **Order Management**: Track and manage incoming orders
- **Earnings Dashboard**: Monitor your performance and earnings
- **Kitchen Showcase**: Upload photos to showcase your cooking space
- **Location-based Service**: Reach customers in your local area

### Platform Features
- **Location-based Matching**: Connect cooks and customers by proximity
- **Image Upload**: Cloudinary integration for meal and kitchen photos
- **Authentication**: Secure JWT-based authentication
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live order status updates

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Image hosting and management
- **Multer** - File upload handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd ghar-se-swaad
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**

   Create `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ghar-se-swaad
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173` to see the application.

## 📁 Project Structure

```
ghar-se-swaad/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Custom components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── types/             # TypeScript type definitions
│   └── assets/            # Images and icons
├── server/                 # Backend source code
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   └── uploads/           # File uploads directory
└── package.json           # Frontend dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Cooks
- `GET /api/cooks` - Get all cooks (with location filtering)
- `GET /api/cooks/:id` - Get cook details
- `POST /api/cooks` - Register as a cook
- `PUT /api/cooks/:id` - Update cook profile

### Meals
- `GET /api/meals` - Get meals (with cook filtering)
- `POST /api/meals` - Add new meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `PUT /api/orders/:id/status` - Update order status

## 🎨 UI Components

The application uses shadcn/ui components built on top of Radix UI primitives:

- **Navigation**: Header with user menu and cart
- **Cards**: Cook cards, meal cards with ratings
- **Forms**: Registration, login, meal creation
- **Modals**: Order confirmation, cook registration
- **Layout**: Responsive grid and flex layouts

## 🔐 Authentication Flow

1. **Registration**: Users can register as customers or cooks
2. **Login**: JWT tokens stored in localStorage
3. **Protected Routes**: Automatic redirects for unauthenticated users
4. **Role-based Access**: Different dashboards for users and cooks

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Breakpoint-based layouts** (sm, md, lg, xl)
- **Touch-friendly interactions** for mobile users
- **Optimized images** and lazy loading

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Use PM2 or similar for production
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set secure JWT secrets
- Configure Cloudinary for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Ensure responsive design
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **Cloudinary** for image management
- **MongoDB** for flexible data storage

## 📞 Support

For support, email support@gharse-swaad.com or join our Discord community.

---

**Made with ❤️ for food lovers and home cooks**
