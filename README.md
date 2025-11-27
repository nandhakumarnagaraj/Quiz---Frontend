# QuizMaster - Angular Frontend

A modern, feature-rich quiz application built with Angular 18+ and TypeScript.

## 🚀 Features

- **User Authentication**: JWT-based authentication with login/register
- **Role-Based Access**: Separate roles for Users and Admins
- **Quiz Management**: 
  - Browse available quizzes
  - Take quizzes with interactive UI
  - View detailed results with question-by-question breakdown
  - Track attempt history
  - View leaderboards
- **Admin Features**:
  - Create new quizzes
  - Edit existing quizzes
  - Delete quizzes
  - Manage questions and options
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations

## 📋 Prerequisites

- Node.js 18+ and npm
- Angular CLI 18+
- Backend API running on http://localhost:8080

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd quiz-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
Update `src/environments/environment.ts` with your API URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

4. Start the development server:
```bash
ng serve
```

5. Open http://localhost:4200 in your browser

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                 # Core services, guards, interceptors
│   │   ├── guards/          # Route guards (auth, admin)
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── services/        # API services
│   ├── shared/              # Shared components and models
│   │   ├── components/      # Reusable components
│   │   └── models/          # TypeScript interfaces
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── quiz/           # Quiz features
│   │   ├── admin/          # Admin features
│   │   └── profile/        # User profile
│   ├── app.component.ts    # Root component
│   ├── app.routes.ts       # Application routes
│   └── app.config.ts       # App configuration
├── environments/            # Environment configs
└── styles.scss             # Global styles
```

## 🎯 Key Technologies

- **Angular 18+**: Latest Angular framework
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development
- **JWT**: Secure authentication
- **ngx-toastr**: Toast notifications
- **Standalone Components**: Modern Angular architecture

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. AuthInterceptor adds token to all API requests
5. Route guards protect authenticated routes

## 🎨 UI Components

- **Login/Register**: User authentication forms
- **Quiz List**: Browse all available quizzes
- **Quiz Take**: Interactive quiz interface with progress tracking
- **Quiz Result**: Detailed results with grade and breakdown
- **Admin Panel**: Create/edit quizzes with dynamic form arrays
- **Navbar**: Responsive navigation with user menu
- **Attempt History**: View past quiz attempts
- **Leaderboard**: Compare scores with other users

## 🚦 API Integration

All API calls go through services:
- `AuthService`: Authentication endpoints
- `QuizService`: Quiz CRUD operations
- `QuizAttemptService`: Quiz submission and history

Error handling is centralized in `ErrorInterceptor`.

## 🎨 Styling

- Custom SCSS with gradient themes
- Responsive design (mobile-first)
- Smooth animations and transitions
- Modern card-based layout

## 🧪 Testing

Run unit tests:
```bash
ng test
```

Run e2e tests:
```bash
ng e2e
```

## 📦 Build

Build for production:
```bash
ng build --configuration production
```

Output will be in `dist/` directory.

## 🔧 Configuration

### Environment Variables
- `environment.ts`: Development config
- `environment.prod.ts`: Production config

### JWT Secret
Ensure the backend JWT secret matches the one in `application.properties`.

## 🐛 Troubleshooting

**CORS Issues**: Ensure backend has CORS configured for http://localhost:4200

**Token Expiration**: Tokens expire after 24 hours (configurable in backend)

**Route Access**: Check user role matches route requirements (User/Admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 👥 Authors

Nandhakumar Nagaraj - Initial work

## 🙏 Acknowledgments

- Angular Team
- Spring Boot Team
- ngx-toastr contributors
*/