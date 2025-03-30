<div align="center">

<h3 align="center">HairBase</h3>

  <p align="center">
    A mobile app for identifying hair products and managing your hair care routine.
    <br />
     <a href="https://github.com/yusufmorsy/hairbase">github.com/yusufmorsy/hairbase</a>
  </p>
</div>


## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

HairBase is a mobile application designed to help users identify hair products by scanning their labels and providing information about the product. It also allows users to track their hair care history and receive personalized recommendations. The application consists of a React Native frontend, a Python FastAPI backend, and a PostgreSQL database. The backend utilizes Groq for OCR and product information retrieval.

### Key Features

- **Product Identification:** Scan hair product labels using the device camera to identify the product.
- **Product Information:** Retrieve detailed information about identified products, including ingredients, hair types, and concerns.
- **Personalized Recommendations:** Receive product recommendations based on hair texture, type, and concerns.
- **Hair Care History:** Track previously scanned products and build a history of hair care routines.
- **Product Contribution:** Add new products to the database by manually entering product information and uploading images.
- **User Onboarding:** A guided onboarding process to gather user preferences for personalized recommendations.


The HairBase application follows a multi-tiered architecture:

- **Frontend:** Developed using Expo/React Native, providing a mobile user interface for scanning products, viewing information, and managing hair care routines.
- **Backend:** Implemented with Python FastAPI, handling API requests, OCR processing (using Groq), and database interactions.
- **Database:** PostgreSQL database stores product information, user preferences, and scan history.
- **Containerization:** Docker and Docker Compose are used for containerizing the backend application and database, simplifying deployment and management.

Key technologies used:

- **Frontend:**
    - Expo
    - React Native
    - Expo Router
    - React Native Reanimated
    - React Native SVG
    - AsyncStorage
    - Gorhom Bottom Sheet
- **Backend:**
    - FastAPI
    - Groq
    - Psycopg
    - Uvicorn
    - Docker
    - Docker Compose
- **Database:**
    - PostgreSQL

## Getting Started

To get started with the HairBase project, follow these steps:

### Prerequisites

- Docker (and Docker Compose) must be installed on your system.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yusufmorsy/hairbase.git
   cd hairbase
   ```

2.  Create a `.env` file in the `backend/app` directory with the following variables, replacing the values with your actual credentials:
    ```
    GROQ_API_KEY=<YOUR_GROQ_API_KEY>
    POSTGRES_URL=<YOUR_POSTGRES_URL>
    ```

3.  Create a `.env` file in the `backend/scraper` directory with the following variables, replacing the values with your actual credentials:
    ```
    PSQL_DB=<YOUR_POSTGRES_URL>
    ```

4.  Navigate to the project root directory and start the application using Docker Compose:
   ```sh
   docker-compose up --build
   ```

   This command will build and start the backend and database containers.

5.  Install the frontend dependencies:
    ```sh
    cd frontend
    npm install
    ```

6.  Start the Expo development server:
    ```sh
    npm start
    ```

   This will open the Expo development tools in your browser, allowing you to run the app on an emulator or physical device.

## Acknowledgments

- This README was created using [gitreadme.dev](https://gitreadme.dev) — an AI tool that looks at your entire codebase to instantly generate high-quality README files.
