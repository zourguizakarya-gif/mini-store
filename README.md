# 🛒 Mini Store API

A modular e-commerce REST API built with **NestJS, TypeScript, PostgreSQL, and TypeORM**. The project provides user management, authentication, product management, order processing, reviews, role-based access control, and AI-powered features.

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Programming language |
| PostgreSQL | Relational database |
| TypeORM | Database ORM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Groq API | AI provider |
| OpenAI SDK | AI integration |
| class-validator | DTO validation |
| Postman | API testing |

## 🏗️ Project Architecture

The application follows a modular architecture, separating responsibilities into independent modules.

- **Auth Module** – User signup, signin, and authentication.
- **Users Module** – User creation, profile updates, retrieval, and deletion.
- **Products Module** – Product creation, retrieval, updates, stock management, and deletion.
- **Orders Module** – Order creation, retrieval, status updates, cancellation, and deletion.
- **Reviews Module** – Product reviews, ratings, updates, and moderation.
- **AI Module** – AI-powered chat, product recommendations, and review analysis.
- **Database Module** – PostgreSQL connection and database configuration.
- **Guards** – Authentication and role-based authorization.

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication.

- User signup and signin.
- Password hashing using bcrypt.
- JWT-based authentication.
- Custom `UsersGuard` for protecting routes.
- Role-based authorization using a custom `Roles` decorator.
- DTO validation using NestJS `ValidationPipe`.
- Ownership checks for user-specific operations.

## 👥 User Roles & Permissions

The application supports three roles: `user`, `manager`, and `admin`.

### 👑 Admin

Has administrative access to the application.

- Create users with different roles.
- Update any user's information and role.
- View and delete users.
- Create, retrieve, update, and delete products.
- View and manage all orders.
- Update and cancel orders.
- Permanently delete orders.
- View and manage reviews.
- Delete any review.

### 🛠️ Manager

Has management permissions with restrictions on administrative operations.

- Create users with the `user` role only.
- Update their own permitted user information.
- View all users.
- Delete users.
- Create, retrieve, and update products.
- View all products, including inactive products.
- View and manage all orders.
- Update and cancel orders.
- View all reviews.
- Moderate and delete reviews.

### 👤 User

Has access to customer-level functionality.

- Update their own profile.
- View active products.
- View individual product information.
- Create orders.
- View their own orders.
- View individual orders belonging to them.
- Cancel their own orders according to order status.
- Create product reviews.
- View product reviews.
- View their own reviews.
- Update and delete their own reviews.

## 👤 Users Management

The Users module handles user administration and account management.

Features:
- User creation with role restrictions.
- User information updates.
- User retrieval.
- User deletion.
- Ownership-based update permissions.
- Role-based access control.

## 📦 Products Management

The Products module manages the store's inventory.

Features:
- Create new products.
- Retrieve all products.
- Retrieve active products.
- Retrieve individual products.
- Update product information.
- Manage product prices and stock.
- Activate or deactivate products.
- Delete products.

Managers and admins can manage products, while users can access active products.

## 🛍️ Orders Management

The Orders module handles the purchasing process and order lifecycle.

Features:
- Create orders for available products.
- Retrieve all orders.
- Retrieve personal order history.
- Retrieve individual orders.
- Update order status.
- Cancel orders.
- Delete orders.

**Stock management:**
- Product stock decreases when an order is created.
- Stock availability is checked before processing an order.
- Purchase prices are recorded at the time of purchase.

**Order permissions:**
- Users can access and cancel their own orders according to the implemented rules.
- Managers and admins can manage orders.
- Only admins can permanently delete orders.

## ⭐ Reviews Management

The Reviews module allows customers to rate and review products.

Features:
- Create product reviews.
- Retrieve all reviews.
- Retrieve reviews belonging to a specific product.
- Retrieve individual reviews.
- Update existing reviews.
- Delete reviews.
- Manage review ownership and permissions.

**Review permissions:**
- Users can create reviews and manage their own reviews.
- A user can review the same product only once.
- Managers and admins can view and moderate reviews.
- Managers and admins can delete any review.

## 🤖 AI Features

The application integrates AI using the **Groq API** through the OpenAI SDK.

### 💬 AI Chat

Provides AI-generated responses to user questions based on relevant product information from the store.

### 🎯 Product Recommendations

Analyzes a user's purchase history and recommends relevant products from the available inventory.

### 📊 Review Analysis

Uses AI to analyze product reviews and generate useful insights from customer feedback.

## 🗄️ Database

The application uses PostgreSQL with TypeORM for database management.

Main entities include:

- **User** – Account information, credentials, and roles.
- **Product** – Product details, prices, stock, and availability.
- **Order** – Customer orders, quantities, purchase prices, totals, and status.
- **Review** – Product ratings, comments, and review ownership.

## 🛡️ Security & Validation

- JWT authentication.
- Password hashing with bcrypt.
- Role-based access control (RBAC).
- Protected routes using custom guards.
- DTO validation.
- Whitelisting accepted request properties.
- Rejection of non-whitelisted properties.
- Ownership checks for protected operations.
- Environment variables for sensitive configuration.

## 🧪 Postman

The project includes Postman collection files for testing the application's functionality.

Collections cover authentication, users, products, orders, reviews, and AI features.


## 📥 Installation

### 1. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and provide your PostgreSQL credentials, JWT secret, and Groq API key.

### 4. Start the application

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

## 📁 Project Structure

```text
src/
├── admin/
├── ai/
├── auth/
├── database/
├── guards/
├── orders/
├── products/
├── reviews/
├── users/
├── app.module.ts
└── main.ts

test/
postman/
.env.example
.gitignore
package.json
README.md
```

## 👨‍💻 Author

**Zakarya**

GitHub: [@zourguizakarya-gif](https://github.com/zourguizakarya-gif)

---

⭐ Feel free to explore, fork, and learn from this project.
