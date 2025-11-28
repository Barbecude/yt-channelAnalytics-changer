# 🚀 Ultimate YouTube Creator Dashboard

<div align="center">

![Project Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=YouTube%20Analytics%20Dashboard&fontSize=50&animation=fadeIn&fontAlignY=38&desc=Powered%20by%20Next.js%20&%20YouTube%20API&descAlignY=55&descAlign=50)

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-Blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </a>
  <a href="https://next-auth.js.org/">
    <img src="https://img.shields.io/badge/NextAuth.js-Security-green?style=for-the-badge&logo=auth0" alt="NextAuth" />
  </a>
</p>

[View Demo](https://your-demo-link.com) · [Report Bug](https://github.com/yourusername/repo/issues) · [Request Feature](https://github.com/yourusername/repo/issues)

</div>

---

## 📖 About The Project

**Managing a YouTube channel shouldn't feel like rocket science.** This dashboard is built to provide **real-time insights** into channel performance, revenue, and audience demographics in a clean, developer-friendly interface. Unlike the default YouTube Studio, this app focuses on what matters most to creators: **Growth & ROI**.

It leverages the power of **Next.js App Router** and **Server Components** to fetch data securely directly from Google's servers.

### ✨ Key Features

* **🔐 Secure Authentication:** Seamless Google Sign-In integration using NextAuth.js.
* **💰 Private Revenue Data:** View estimated revenue (AdSense) securely (Protected Routes).
* **📈 Real-time Analytics:** Track Subscribers, Total Views, and Video Counts instantly.
* **🌍 Audience Demographics:** Interactive Geo-Maps showing where your viewers are watching from.
* **⚡ Server-Side Performance:** Blazing fast load times using React Server Components.
* **🎨 Responsive UI:** Beautifully crafted with Tailwind CSS for mobile and desktop.

---

## 📸 Screenshots

<div align="center">
  <img src="https://placehold.co/800x450/EEE/31343C?text=Dashboard+Preview+Image" alt="Dashboard Screenshot" width="800" />
</div>

> *The interface automatically adapts based on user authentication state.*

---

## 🛠️ Tech Stack

This project was built using the modern web stack:

| Category | Technology |
|Data Fetching| **SWR & Server Actions** |
| UI Framework | **Next.js 14 (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Authentication | **NextAuth.js (Google Provider)** |
| API | **YouTube Data API v3 & Analytics API** |
| Icons | **Lucide React** |

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* Node.js (v18 or higher)
* Google Cloud Console Project with **YouTube Data API v3** & **YouTube Analytics API** enabled.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your Google API credentials:

    ```env
    # Google OAuth
    GOOGLE_CLIENT_ID=your_client_id
    GOOGLE_CLIENT_SECRET=your_client_secret

    # NextAuth Config
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_random_secret_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to view the dashboard!

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 👤 Author

**Your Name**

* YouTube: [@DudeBarbecude](https://youtube.com/@dudebarbecude)
* GitHub: [@Barbecude](https://github.com/Barbecude)

---

<p align="center">
  Built with ❤️ and ☕ using Next.js
</p>
