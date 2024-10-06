# WebWizards - Social Media Platform

[![Heroku](https://img.shields.io/badge/Deployed%20on-Heroku-430098?logo=heroku)](https://social-distribution-95d43f28bb8f.herokuapp.com/signin)

WebWizards is a modern social media platform that combines the power of Django for the backend and React for the frontend. This application allows users to create profiles, follow others, post content, and interact with each other through likes, comments, and reposts. It also features a light/dark theme toggle for enhanced user experience.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [License](#license)

## Features

- **User Authentication**: Users can sign up, sign in, and manage profiles.
- **Timeline Interaction**: Users can create posts, comment, like, and repost content.
- **Followers System**: Users can follow and interact with other users' timelines.
- **Notifications**: Users get notifications for interactions on their posts.
- **Dark Mode**: A theme toggle that allows users to switch between light and dark modes.
- **GitHub Activity Fetcher**: Background task to fetch user activity from GitHub (Django management command).

## Technologies Used

### Backend

- **Django**: Used to build the backend API and manage user authentication. 
- **Django REST Framework**: API development and serialization.
- **PostgreSQL**: As the production-grade database to store user data, posts, and interactions.
- **Heroku**: Backend is deployed on Heroku with the necessary configurations for scaling and using PostgreSQL as a managed database service.

### Frontend

- **React**: Provides the dynamic UI/UX for the frontend.
- **React Context API**: Used to manage state for theme toggling (dark/light mode) and user session.
- **CSS Modules**: For styling individual components and pages, ensuring better code maintainability.
- **Axios**: For API requests and data fetching between React frontend and Django backend.

### DevOps and Tools

- **Heroku**: Hosting and deployment of the backend with PostgreSQL as the database.
- **Git**: Version control and collaboration.
- **React Testing Library**: Unit tests for React components.
- **Django Management Commands**: Custom commands like fetching GitHub activity data.
- **Procfile**: Configuring the deployment processes on Heroku.
  
## Project Structure

Here’s a brief overview of the project’s folder structure:

```bash
.
├── LICENSE
├── Procfile                  # Heroku process configuration
├── README.md                 # Project documentation
├── db.sqlite3                # Development database (SQLite)
├── manage.py                 # Django entry point
├── requirements.txt          # Python dependencies
├── webwizards/               # Django project files
├── webwizards-frontend/      # React frontend app
├── webwizardsapp/            # Django app for handling core functionality
```

### Backend (Django)

- **webwizardsapp**: Contains models, views, and serializers for the application.
  - `urls.py`: Defines API routes.
  - `views.py`: Contains logic for handling requests and responses.
  - `models.py`: Defines the data models (user profiles, posts, etc.).
  - `fetch_github_activity.py`: A custom Django management command for fetching GitHub activity.

### Frontend (React)

- **src/components**: Contains individual UI components like posts, comments, and modals.
- **src/pages**: Defines different pages such as profile, timeline, sign-in, and sign-up.
- **App.js**: The root component where routes are defined and state is managed.

## Installation

To run this project locally, you’ll need to set up both the backend (Django) and frontend (React). Follow the steps below:

### Backend (Django)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/webwizards.git
   cd webwizards
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up PostgreSQL as your local database and configure the `DATABASES` setting in `webwizards/settings.py` to match your local environment. Example configuration:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'your_db_name',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

4. Run migrations to set up the database:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd webwizards-frontend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

After setting up both backend and frontend:

1. Open the React app at `http://localhost:3000` to interact with the platform.
2. The backend will be running at `http://localhost:8000/api/` and can be tested using tools like Postman or cURL.

## Deployment

The backend is deployed on Heroku. To deploy:

1. Set up Heroku CLI and log in:
   ```bash
   heroku login
   ```

2. Create a Heroku app:
   ```bash
   heroku create
   ```

3. Add PostgreSQL as an addon to your Heroku app:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. Push the code to Heroku:
   ```bash
   git push heroku main
   ```

5. Run database migrations on Heroku:
   ```bash
   heroku run python manage.py migrate
   ```

To deploy the frontend (e.g., Netlify):

1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to your hosting provider (like Netlify or Vercel).

## Contributors

This project was created with contributions from:

- **Roopdilawar Singh**
- **Julie Pilz**
- **Kannan Khosla**
- **Swastik Sharma**
- **Neville Albuquerque**

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for more details.
