# Biz Pulse AI 🚀

**AI-powered financial intelligence and payment management for small businesses.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-635BFF?style=for-the-badge)](https://biz-pulse-ai-beta.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/sunayanapadhy12-lab/biz-pulse-ai)

## 🌐 Live Deployment

**Try Biz Pulse AI:** https://biz-pulse-ai-beta.vercel.app

## 💡 About the Project

Biz Pulse AI is a financial management application designed to help small businesses monitor invoices, track incoming payments, identify overdue receivables, and streamline payment collection.

It combines an intuitive financial dashboard, backend persistence, and PayPal Sandbox integration to demonstrate a smarter approach to small-business cash flow management.

## ✨ Key Features

- **Financial Dashboard:** Monitor billed revenue, collected payments, pending settlements, and overdue receivables.
- **Invoice Management:** View and manage invoice records and payment statuses.
- **AI Payment Agent / Dunning Scan:** Identify invoices requiring payment follow-up and surface reminder activity.
- **PayPal Integration:** Create PayPal Sandbox checkout orders and process payment approval and capture through the backend.
- **Transaction Tracking:** Store and retrieve transaction records.
- **CSV Export:** Download invoice data for reporting and analysis.
- **Persistent Database:** Supabase-backed storage for invoices, transactions, PayPal orders, and webhook event tracking.
- **Payment Safety:** Backend-side payment validation and duplicate-event protection.

## 🛠️ Technology Stack

- React
- TypeScript
- Vite
- Node.js
- Express
- Supabase
- PayPal Sandbox
- Vercel

## 🏗️ Architecture

1. The React frontend displays financial metrics, invoices, and transactions.
2. The Express backend exposes API endpoints for invoice and payment operations.
3. Supabase provides persistent application storage.
4. PayPal Sandbox supports checkout order creation and payment capture workflows.
5. Vercel hosts the deployed application and serverless API routes.

## 🚀 Run Locally

### Prerequisites

- Node.js
- npm
- A Supabase project
- PayPal Sandbox developer credentials

### 1. Clone the repository

```bash
git clone https://github.com/sunayanapadhy12-lab/biz-pulse-ai.git
cd biz-pulse-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Use `.env.example` as a reference.

Configure the required server-side Supabase and PayPal credentials. Never commit `.env` or expose secret keys in frontend variables.

### 4. Start the frontend

```bash
npm run dev
```

### 5. Start the backend

In a separate terminal:

```bash
npm run server
```

## 🔐 Security Notes

- Keep Supabase service-role credentials on the server only.
- Never commit API secrets or private keys.
- Use PayPal Sandbox credentials for testing.
- Verify payment approval and capture on the backend before marking an invoice as paid.

## 🧪 Testing

The project has undergone local build, lint, persistence, API, and PayPal Sandbox workflow testing.

A successful approved PayPal capture and complete live production payment flow should be independently verified before treating payment processing as production-ready.

## 🗺️ Project Status

Biz Pulse AI is an actively developed hackathon project. The frontend is deployed, and backend persistence and Sandbox payment workflows have been implemented. Production environment configuration and end-to-end payment verification remain important deployment checks.

## 👩‍💻 Repository

**GitHub:** https://github.com/sunayanapadhy12-lab/biz-pulse-ai

**Live App:** https://biz-pulse-ai-beta.vercel.app

---

*Built to make small-business financial operations smarter, clearer, and easier to manage.*


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
