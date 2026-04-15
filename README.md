# 🧩 Trello Clone -- Full Stack Project

A full-stack **Trello-like project management application** built using
modern web technologies. It allows users to create boards, manage lists,
add cards, assign members, apply labels, and track tasks efficiently.

------------------------------------------------------------------------

# 🚀 Tech Stack

### 💻 Frontend

-   React.js
-   JavaScript
-   Tailwind

### ⚙️ Backend

-   Node.js
-   Express.js

### 🗄️ Database

-   MySQL (Cloud hosted on Aiven)

### 🌐 Deployment Platforms

-   Frontend → Vercel
-   Backend → Render
-   Database → Aiven (MySQL Cloud)

------------------------------------------------------------------------

# 📦 Dependencies

### Frontend

``` json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/react": "^0.4.0",
  "axios": "^1.15.0",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-feather": "^2.0.10",
  "react-tiny-popover": "^8.1.6"
}
```

### Backend

``` json
{
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "mysql2": "^3.22.0"
}
```

------------------------------------------------------------------------

# ⚙️ How to Run the Project

## 🔹 1. Clone Repository

``` bash
git clone <https://github.com/BhavikKumar7/Trello-Clone>
cd trello-clone
```

------------------------------------------------------------------------

## 🔹 2. Setup Backend

``` bash
cd server
npm install
```

### Create `.env` file

``` env
PORT=5000

DB_HOST=your-aiven-host
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb

```

### Start Backend

``` bash
nodemon server.js
```

------------------------------------------------------------------------

## 🔹 3. Setup Frontend

``` bash
cd client
npm install
```

### Create `.env`

``` env
VITE_API_URL=http://localhost:5000/api
```

### Start Frontend

``` bash
npm run dev
```

------------------------------------------------------------------------

# 📁 Project Structure

    trello-clone/
    │
    ├── client/                # Frontend (React)
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Board/
    │   │   │   ├── List/
    │   │   │   ├── Card/
    │   │   │   └── Modal/
    │   │   ├── api/
    │   │   ├── pages/
    │   │   └── styles/
    │   └── package.json
    │
    ├── server/                # Backend (Express)
    │   ├── src/
    │   │   ├── routes/
    │   │   ├── controllers/
    │   │   ├── config/
    │   │   │   └── db.js
    │   │   └── middleware/
    │   └── package.json
    │
    └── README.md

------------------------------------------------------------------------

# 🗄️ Database Schema

## 📌 Tables Overview

### 1. users

``` sql
id (PK)
name
email
```

------------------------------------------------------------------------

### 2. boards

``` sql
id (PK)
title
created_at
background
position
```

------------------------------------------------------------------------

### 3. lists

``` sql
id (PK)
board_id (FK → boards.id)
title
position
```

------------------------------------------------------------------------

### 4. cards

``` sql
id (PK)
list_id (FK → lists.id)
title
description
position
due_date
created_at
is_completed
```

------------------------------------------------------------------------

### 5. labels

``` sql
id (PK)
name
color
```

------------------------------------------------------------------------

### 6. card_labels (Many-to-Many)

``` sql
card_id (FK → cards.id)
label_id (FK → labels.id)
```

------------------------------------------------------------------------

### 7. card_members (Many-to-Many)

``` sql
card_id (FK → cards.id)
user_id (FK → users.id)
```

------------------------------------------------------------------------

### 8. board_members

``` sql
id (PK)
board_id (FK → boards.id)
user_id (FK → users.id)
```

------------------------------------------------------------------------

### 9. checklist_items

``` sql
id (PK)
card_id (FK → cards.id)
text
is_completed
```

------------------------------------------------------------------------

# 🔗 Relationships

-   One **Board → Many Lists**
-   One **List → Many Cards**
-   One **Card → One Labels**
-   One **Card → Many Members**
-   One **Board → Many Members**

------------------------------------------------------------------------

# 🔥 Features

-   Drag & Drop (Lists & Cards)
-   Create / Edit / Delete Boards, Lists, Cards
-   Assign Members to Cards
-   Add Labels & Due Dates
-   Checklist support
-   Filtering (Label, Member, Due Date)
-   Optimistic UI updates

------------------------------------------------------------------------

# ⚠️ Important Notes

-   Use backticks for reserved keywords like:

``` sql
`position`
```

-   Always use environment variables (never hardcode credentials)

-   Ensure SSL is enabled for Aiven MySQL connection

------------------------------------------------------------------------

# 🚀 Deployment Flow

    Frontend (Vercel)
            ↓
    Backend (Render)
            ↓
    MySQL Database (Aiven)

------------------------------------------------------------------------

# 📈 Future Improvements

-   Real-time updates (WebSockets)
-   Notifications system
-   Activity logs
-   File attachments
-   Team roles & permissions (RBAC)

------------------------------------------------------------------------

# 👨‍💻 Author

Bhavik Kumar\
Computer Science & Engineering Student

------------------------------------------------------------------------

# ⭐ Final Status

✔ Full-stack application\
✔ Cloud database integration (Aiven)\
✔ Drag-and-drop UI\
✔ Ready for production deployment