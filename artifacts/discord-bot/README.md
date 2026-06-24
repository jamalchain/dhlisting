# Community Discord Bot

A powerful community moderation bot with cage, strip, role management, and more.

---

## Commands

| Command | Description |
|---|---|
| `/say` | Make the bot send a formatted embed message |
| `/role` | Give a role to a member |
| `/unrole` | Remove a role from a member |
| `/kick` | Kick a member from the server |
| `/mute` | Timeout (mute) a member with a set duration |
| `/unmute` | Remove a timeout from a member |
| `/cage` | Assign the jail role to a member (keeps their other roles) |
| `/uncage` | Release a member from the cage |
| `/strip` | ⚡ Strip ALL roles and instantly cage a member in one command |

All commands are restricted to **server owners** and members with the **whitelist role**.

---

## Setup

### 1. Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it
3. Go to **Bot** → click **Add Bot**
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy your **Bot Token**
6. Go to **OAuth2 → General** and copy your **Client ID**

### 2. Invite the Bot

Go to **OAuth2 → URL Generator**, select:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Manage Roles`, `Kick Members`, `Moderate Members`, `Send Messages`, `Read Message History`, `View Channels`

Copy the generated URL and open it to invite your bot.

### 3. Set Up Your Server

1. Create a role called **`Caged`** (or whatever you set `JAIL_ROLE_NAME` to)
   - This role should only have access to a `#jail` channel
   - Make sure the bot's role is **above** the Caged role in the role list
2. Create a role called **`Bot Access`** (or whatever you set `WHITELIST_ROLE_NAME` to) — this is the whitelist role
3. Create a `#cage-logs` channel and copy its channel ID for `LOG_CHANNEL_ID`

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```
DISCORD_TOKEN=       # Your bot token
CLIENT_ID=           # Your application's client ID
GUILD_ID=            # Your Discord server ID
OWNER_IDS=           # Comma-separated owner user IDs
WHITELIST_ROLE_NAME= # Role name that can use bot commands (default: Bot Access)
JAIL_ROLE_NAME=      # Role name for the cage (default: Caged)
LOG_CHANNEL_ID=      # Channel ID where cage/strip logs go
```

### 5. Deploy Slash Commands

Run once to register slash commands to your server:

```bash
npm run deploy
```

### 6. Start the Bot

```bash
npm start
```

---

## Deploying to Railway

1. Push this folder to a GitHub repo
2. Create a new Railway project → **Deploy from GitHub repo**
3. Select your repo
4. Go to **Variables** and add all the environment variables from `.env`
5. Railway will auto-detect Node.js and run `npm start`

> ⚠️ You still need to run `npm run deploy` **once** locally (or in Railway shell) to register slash commands before they appear in Discord.

---

## How the Cage System Works

### `/cage @user`
- Adds the `Caged` role to the member
- Logs the action to the log channel with moderator info

### `/strip @user`
- Removes **all** roles from the member (that the bot can manage)
- Adds the `Caged` role
- Logs the full list of stripped roles to the log channel

### `/uncage @user`
- Removes the `Caged` role
- Member needs to be manually given back their roles (unless you use `/role`)

---

## Permission Hierarchy

```
Server Owner
    ↓ (always authorized)
Bot Access role members
    ↓ (authorized via WHITELIST_ROLE_NAME)
Everyone else
    ↓ (blocked — ephemeral error message)
```
