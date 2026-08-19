# React + Vite

## Render deployment

In the Render service settings, add these environment variables before deploying:

- `VITE_ADMIN_EMAIL`: the admin email address
- `VITE_ADMIN_PASSWORD`: the admin password

They are build-time variables for this Vite static site, so trigger a new deploy after changing them. Do not commit `.env.local` or put real credentials in `render.yaml`.

The current admin check runs in the browser and is not a secure authentication system for sensitive data. Use a server-side authentication provider before exposing confidential admin functionality.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
