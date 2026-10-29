Employee Management System:
A full-stack web application for managing employee records, built using React, Python, Django REST Framework, and MySQL.

Project Overview:
The Employee Management System provides a simple dashboard for adding, viewing, searching, updating, and deleting employee records. It connects a React frontend to a Django REST API and stores employee information in a MySQL database.

 Features:
- Add new employee records.
- View employee details in a table.
- Update existing employee information.
- Delete employee records.
- Search employees by name, email, or department.
- View total employee and department counts.
- Responsive dashboard interface.

Technology Stack:

Frontend:
- React
- JavaScript
- HTML and JSX
- CSS
- Vite

Backend:
- Python
- Django
- Django REST Framework

Database:
- MySQL

Tools:
- Visual Studio Code
- Git and GitHub

Prerequisites:
Install the following software before running the project:

- Python
- Node.js and npm
- MySQL Server
- Git

Setup Instructions :

1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Employee_Management_System
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

2. Configure the MySQL database

Start MySQL and create the project database:

```sql
CREATE DATABASE employee_management;
```

3. Configure the Django backend

Open a terminal in the `backend` directory.

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it in Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required packages:

```bash
python -m pip install Django djangorestframework mysqlclient python-dotenv
```

Create a private `.env` file inside `backend/` with the following variables:

```dotenv
DJANGO_SECRET_KEY=your_private_django_secret_key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

MYSQL_DATABASE=employee_management
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
```

Replace the example values with your local credentials. Never upload this file to GitHub.

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000/`.

The employee API endpoint is:

`http://127.0.0.1:8000/api/employees/`

4. Configure the React frontend

Open a second terminal in the `frontend` directory:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173/`.

Keep both development servers running while using the application.

How It Works

1. Users interact with the React dashboard.
2. React sends HTTP requests to the Django REST API.
3. Django processes the requests and communicates with MySQL.
4. The API returns employee data to React.
5. React updates the employee list and dashboard statistics.

Future Improvements

- User authentication and role-based access.
- Form validation and improved error handling.
- Pagination for large employee lists.
- Automated backend and frontend testing.
- Deployment to a hosting platform.

Author
Soundarya Gorr

GitHub: [Soundarya-gorr](https://github.com/Soundarya-gorr)

