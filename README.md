# **✨ SparkleBot: Your Ultimate Discord Companion**

Welcome to **SparkleBot**, a feature-rich Discord bot packed with economy, music, and moderation tools! Designed to enhance your server with interactive commands, currency systems, and seamless music playback, SparkleBot brings both fun and functionality to your community.

---

## **🎉 Bot Overview**

**SparkleBot** transforms your Discord server into an engaging hub with:
- **💰 SparkleCoin Economy** – Earn, spend, and compete for riches  
- **🎵 High-Quality Music** – Play tracks from YouTube directly in voice channels  
- **📊 Server Management** – Logs, member tracking, and more  
- **🎮 Interactive Games** – Robbery, leaderboards, and daily rewards  

Built with **discord.js v14**, this bot combines performance with stunning visual embeds.

---

## **🌟 Key Features**

### **💰 SparkleCoin Economy**
Your server's own currency system with rewards, trading, and leaderboards.

> [!NOTE]  
> **Pro Tip:** Use `/daily` every 24h for free coins!  

| Command       | Description                          | Example                  |
|---------------|--------------------------------------|--------------------------|
| **/balance**  | Check your coins                     | `/balance`               |
| **/pay**      | Send coins to friends                | `/pay @user 100`         |
| **/rob**      | Steal coins (60% success rate!)      | `/rob @user`             |
| **/top**      | Server's richest players             | `/top`                   |

---

### **🎵 Music System**
Crystal-clear audio playback with queue management.

> [!WARNING]  
> **Requires voice channel permissions!**  

| Command       | Description                          | Example                  |
|---------------|--------------------------------------|--------------------------|
| **/play**     | Play a song (URL or search)          | `/play Never Gonna Give You Up` |
| **/skip**     | Skip current track                   | `/skip`                  |
| **/queue**    | Show upcoming songs                  | `/queue`                 |
| **/stop**     | Clear queue and disconnect           | `/stop`                  |

---

### **🛡️ Moderation & Logging**
Keep your server safe and organized.

> [!IMPORTANT]  
> **Admin-only commands require permissions!**  

| Feature               | Description                          |
|-----------------------|--------------------------------------|
| **Message Delete Logs** | Tracks deleted messages in logs channel |
| **Join/Leave Alerts** | Welcomes new members and logs leaves |
| **Auto Member Counter** | Updates voice channel with member count |

---

## **⚙️ Installation & Setup**

### **Requirements**
- Node.js v18+
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- YouTube API Key (for music)

## **🚀 Quick Start Guide**

### **Prerequisites**
- Node.js v18+
- Discord Bot Token
- FFmpeg installed

### **Installation**
```bash
# Clone repository
git clone https://github.com/yourusername/SparkleBot.git
cd SparkleBot

# Install dependencies
npm install

# Create .env file
echo "BOT_TOKEN=your_bot_token_here" > .env
echo "APPLICATION_ID=your_app_id" >> .env

# Start the bot
node main.js
```
![dddd](https://github.com/user-attachments/assets/3a46f0c2-4ce7-4258-bcbe-4d3f5cdd1a56)


