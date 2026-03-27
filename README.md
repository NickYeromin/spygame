# 🔫🤠 Spy Game
## 🚀About the Project
**Spy Game** is an electronic version of the classic card game "Spy".
There are two roles: players and a spy.

The goal for the players is to identify who the spy is, while the spy’s task is to guess the hidden location without revealing their identity.

## 💬 Comunication players
Communication between players is not provided within the game, therefore:
Players communicate with each other either in real life (in the same room, offline) or online using any messenger with voice call support.

## ▶ Demo
<p align="center">
  <img src="Spy DEMO/1.png" width="500" />
    <img src="Spy DEMO/2.png" width="500" />
    <img src="Spy DEMO/3.png" width="500" />
    <img src="Spy DEMO/4.png" width="500" />
    <img src="Spy DEMO/5.png" width="500" />
    <img src="Spy DEMO/6.png" width="500" />
    <img src="Spy DEMO/7.png" width="500" />
</p>

---

## 📦 Technologies
### 🌕Front-End (client)
- **HTML5 + React** - interface wich user
- **CSS3** — UI styling and layout
- **JavaScript** - managing local state and handling socket connection
- **Socket.io** - real-time data exchange between clients

### 🌕Back-End (client)
- **Node.js + Express.js** - server and API handling
- **Socket.io** - real-time communication between server and clients
- **JavaScript** - game logic implementation

  
  ---
  
## 🛠️ Installation and Run Project
```bash
# Clone the repository
git clone https://github.com/NickYeromin/spygame/.git

# Installing dependencies
npm init -y
npm install ws

# Run project server
node spy-server/server.cjs

# Run project client
npm run dev  -- --host

# All commands to run from the root folder of the project
# ⚠️ Before running the client, make sure to set the correct server address in api/socket.js
