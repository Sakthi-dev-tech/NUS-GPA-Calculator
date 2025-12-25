# 🎓 NUS GPA Calculator

<div align="center">

A modern, feature-rich GPA calculator designed specifically for National University of Singapore (NUS) students. Track your academic performance, manage your modules, and share your progress with ease.

**[🚀 Try it now!](https://tinyurl.com/NUSGPACalculator)**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 📊 **Comprehensive GPA Tracking**
- **Real-time GPA Calculation**: Instant updates as you add or modify grades
- **Semester-by-Semester Breakdown**: Organize modules by academic semester
- **Cumulative & Semester GPA**: Track both overall and per-semester performance
- **S/U Option Support**: Properly handles Satisfactory/Unsatisfactory grading (AY2021/22 onwards rules)

### 💾 **Data Persistence & Sharing**
- **Local Storage**: Automatically saves all your data in your browser
- **Shareable URLs**: Generate unique shortened links to share your GPA data across devices
- **Import/Export**: Seamlessly transfer data between browsers using generated URLs
- **No Account Required**: Privacy-first approach with no server-side storage

### 🎨 **Beautiful User Interface**
- **NUS-Themed Design**: Official NUS orange and blue color scheme
- **Glassmorphism Effects**: Modern, premium visual design
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Responsive Layout**: Perfect on desktop, tablet, and mobile devices
- **Dark Mode Friendly**: Eye-friendly interface for extended use

### 🖼️ **Image Generation**
- **Share Your Results**: Generate beautiful, shareable images of your GPA
- **Customized Design**: NUS-branded cards with your GPA data
- **One-Click Copy**: Copy generated images directly to clipboard
- **Social Media Ready**: Perfect for sharing achievements

### 📚 **NUS-Specific Features**
- **NUS Grading Scale**: A+, A, A-, B+, B, B-, C+, C, D+, D, F
- **Modular Credit System**: Accurately tracks MCs for GPA calculations
- **S/U Module Handling**: MCs count towards graduation but excluded from GPA when graded 'S'

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: GitHub Pages
- **URL Shortening**: is.gd API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sakthi-dev-tech/NUS-GPA-Calculator.git
   cd NUS-GPA-Calculator/gpa-calc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📖 Usage

### Adding Modules

1. Click **"Add Semester"** to create a new academic semester
2. Within each semester, click **"Add Module"** to add a new course
3. Enter the **Module Code** (e.g., CS1010, MA1521)
4. Enter the **Modular Credits** (MCs)
5. Select your **Grade** from the dropdown
6. Optionally enable **S/U** if you're taking the module as Satisfactory/Unsatisfactory

### Managing Data

- **Edit**: Click on any module field to edit it
- **Delete**: Remove individual modules or entire semesters
- **Save**: Data is automatically saved to local storage
- **Share**: Click the share button to generate a unique URL
- **Export Image**: Generate a shareable image of your GPA results

### S/U Module Rules

The calculator follows NUS's official S/U policy (AY2021/22 onwards):
- Grades D and above → Satisfactory (S)
- MCs count towards graduation requirements
- Not included in GPA calculation

---

## 🚢 Deployment

This project is configured for deployment on **GitHub Pages**.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
1. Build the production bundle
2. Create a `.nojekyll` file for GitHub Pages
3. Deploy to the `gh-pages` branch

---

## 📁 Project Structure

```
gpa-calc/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   └── page.tsx        # Main page component
│   ├── components/
│   │   └── GPACalculator.tsx  # Core calculator component
│   └── styles/
├── public/
│   ├── icon.png            # App favicon
│   └── nus-logo.png        # NUS official logo
├── scripts/
│   └── create-nojekyll.js  # Post-build script for GitHub Pages
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any bugs:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- Built with inspiration from the NUS community
- NUS branding and color scheme
- Thanks to all NUS students who provided feedback

---

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for NUS Students**

[Live Demo](https://tinyurl.com/NUSGPACalculator) • [Report Bug](https://github.com/Sakthi-dev-tech/NUS-GPA-Calculator/issues) • [Request Feature](https://github.com/Sakthi-dev-tech/NUS-GPA-Calculator/issues)

</div>
