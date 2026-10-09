# 🧠 NeuroScan AI – Brain Tumor Detection & Explainable AI Platform

NeuroScan AI is a web-based brain MRI analysis platform designed to support the identification and classification of potential brain tumors. It provides a modern interface for uploading MRI scans, viewing AI-assisted analysis results, and presenting information in an understandable format.

The platform explores the application of artificial intelligence and deep learning in medical image analysis through an interactive dashboard and an explainability-oriented workflow.

> **Disclaimer:** This project is intended for educational and research purposes only. It is not a substitute for professional medical diagnosis or treatment.

---


## 🚀 Live Demo

🔗 https://brainscan-backend-yxhv.onrender.com

> Click the link above to access the deployed application.


## 🚀 Project Overview

Brain tumors are serious medical conditions that require careful examination of medical images. Analyzing MRI scans manually requires specialized medical knowledge and can be time-consuming.

NeuroScan AI aims to demonstrate how AI-assisted image analysis can support the medical imaging workflow by combining MRI image input, analysis results, and an interactive user interface in one application.

The platform focuses on:

- Brain MRI image analysis
- AI-assisted tumor detection and classification
- Interactive results dashboard
- Explainable AI (XAI)-oriented result presentation
- Modern and responsive user interface
- Simplified medical image analysis workflow

---

## 📌 Problem Statement

Manual analysis of brain MRI images requires expertise and can be time-consuming. Interpreting medical images and identifying potential abnormalities requires careful examination by qualified healthcare professionals.

This project explores an AI-assisted approach to brain MRI analysis through a web-based platform.

The system aims to:

- Simplify the MRI image submission process
- Explore automated brain tumor detection and classification
- Present analysis results in a clear format
- Improve the accessibility of AI-assisted medical image analysis
- Provide an interactive interface for viewing results

---

## 🎯 Objectives

The main objectives of NeuroScan AI are:

- Develop a user-friendly brain MRI analysis platform
- Implement an interface for MRI image submission
- Integrate the configured AI analysis method
- Present analysis results in an understandable format
- Explore explainability-oriented result presentation
- Develop a modern and responsive dashboard
- Provide a structured workflow for image analysis
- Demonstrate the application of AI in healthcare research
- Document system limitations and encourage professional medical review

---

## ✨ Key Features

### 🏠 Modern Landing Page

The platform includes a landing page that introduces the project and its capabilities.

Features include:

- Modern healthcare AI design
- Project introduction and overview
- Feature highlights
- Navigation to the analysis workflow
- Responsive layout
- Interactive user interface

### 🧠 Brain MRI Analysis

The application provides an interface for submitting brain MRI images for analysis.

Features include:

- MRI image input
- AI-assisted analysis through the configured model or service
- Display of returned analysis results
- Loading and error states
- Organized presentation of results

### 📊 Interactive Dashboard

The dashboard provides a centralized interface for accessing the application's analysis features.

Features include:

- Analysis overview
- MRI-related result presentation
- Structured information display
- Interactive dashboard components
- Consistent navigation
- Responsive design

### 🔍 Explainable AI (XAI)

Explainable AI focuses on making AI-generated results easier to understand.

The platform is designed to support an explainability-oriented workflow. Specific methods such as Grad-CAM, heatmaps, or attention maps should be documented only if they are implemented in the application.

AI-generated explanations should not be treated as proof that a prediction is medically correct.

### 🎨 User Interface

- React-based frontend
- Reusable components
- Consistent visual styling
- Responsive page layout
- Clear navigation
- User-friendly interactions

---

## 🧠 AI and Model Approach

The project focuses on AI-assisted brain tumor detection and classification using MRI images.

The exact model architecture and analysis method depend on the implementation used in the repository.

### Main Components

- **Input:** Brain MRI image supported by the application
- **Processing:** Image submission and analysis through the configured AI service or model
- **Analysis:** Detection, classification, or image interpretation according to the implemented functionality
- **Output:** Analysis results displayed through the user interface
- **Visualization:** Presentation of the returned results in the dashboard

### AI Technology

If Google Gemini API is used in the implementation, it should be described as an external multimodal AI service used for image analysis. It should not be described as a custom-trained brain tumor classification model unless a separate model was trained and evaluated.

If a trained deep-learning model is integrated, document its architecture, dataset, preprocessing steps, and evaluation results based on the actual implementation.

### Medical Limitations

AI-generated outputs may be incorrect. The system is intended for educational and research purposes and must not be used independently for diagnosis, treatment selection, or other clinical decisions.

---

## 🏗️ System Architecture

The high-level workflow for an application using a React frontend and an external AI service is shown below.

```text
                 USER
                   |
                   v
          React + TypeScript UI
                   |
                   v
            MRI Image Input
                   |
                   v
        Application Analysis Service
                   |
                   v
       Configured AI / Model Endpoint
                   |
                   v
         Returned Analysis Results
                   |
                   v
          Results Dashboard
```

If the repository includes a separate backend, database, or locally hosted model, update this architecture to reflect the actual implementation.

### Architecture Benefits

- Modular application structure
- Separation of user interface and analysis logic
- Reusable components
- Organized result presentation
- Easier maintenance
- Potential for future expansion

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS or standard CSS, depending on the implementation
- React components and hooks

### AI and Image Analysis

- Google Gemini API, if configured
- Deep-learning model, if separately implemented
- MRI image analysis workflow

### Development Tools

- Node.js
- npm
- Git
- GitHub
- Visual Studio Code

### Deployment

- The hosting provider configured for the application
- Backend hosting, if a separate backend is used

---

## 📂 Project Structure

The following is a representative structure for a React and Vite project. Adjust it to match the actual repository.

```text
neuroscan-ai/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

Replace the placeholder URL with the actual GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd neuroscan-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root if the application requires environment variables.

Example, only if this matches the variable name expected by your code:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Use the exact environment variable name referenced in the source code.

**Security note:** Variables beginning with `VITE_` are exposed to client-side code. Do not use this approach to keep a private API key secret in a production application. For production, use a backend service that stores the key securely.

Never upload real API keys or credentials to GitHub.

### 4. Run the Application

```bash
npm run dev
```

Open the local URL displayed in the terminal. Vite commonly uses:

```text
http://localhost:5173
```

### 5. Build the Application

```bash
npm run build
```

If the project defines a preview script, run:

```bash
npm run preview
```

---

## 🔐 Security and Privacy

- Never commit API keys or private credentials.
- Keep `.env` files out of version control.
- Use secure backend handling for private API credentials.
- Validate uploaded files.
- Avoid uploading identifiable patient data without appropriate authorization.
- Review the external AI provider's data-handling policies before transmitting medical images.
- Use anonymized or synthetic images for demonstrations when possible.

---

## 🌐 Deployment

The frontend can be deployed to a hosting platform that supports Vite applications.

Typical build settings:

- **Build command:** `npm run build`
- **Output directory:** `dist`

Configure required environment variables through the hosting provider's settings.

If the application uses a separate backend, deploy it separately and configure the frontend API URL according to the application's source code.

Add the live demo URL to this README only after deployment has been completed and verified.

---

## 🧪 Testing and Evaluation

The application should be tested for:

- Valid MRI image input
- Unsupported file formats
- Empty image submissions
- Successful analysis responses
- API errors and unavailable services
- Loading and error states
- Correct display of analysis results
- Responsive user interface behavior

If a trained model is used, evaluate it using a suitable test dataset and report verified metrics such as accuracy, precision, recall, F1-score, and a confusion matrix.

Do not report unverified performance figures or claim clinical validation without supporting evidence.

---

## 🔮 Future Enhancements

- Integrate a validated brain MRI classification model
- Add image preprocessing and quality checks
- Implement Grad-CAM or another suitable explanation method
- Improve structured result visualization
- Add secure analysis history
- Improve input validation and error handling
- Add automated software tests
- Evaluate model performance on suitable datasets
- Improve backend security and API-key management
- Conduct further research with appropriate medical expertise

---


