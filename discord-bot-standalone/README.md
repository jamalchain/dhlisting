# Community Discord Bot

## Setup on Railway

### 1. Push this folder as its own GitHub repo
This folder is standalone — no monorepo, no pnpm. Push **only the contents of this folder** to a new GitHub repo.

### 2. Create a Railway project
- New project → Deploy from GitHub repo → select your repo
- Railway will auto-detect Node.js and use `node src/index.js`
- No Root Directory setting needed

### 3. Add environment variables in Railway
| Variable | Value |
|---|---|
| `DISCORD_TOKEN` | Your bot token |
| `CLIENT_ID` | Your app's client ID |
| `GUILD_ID` | Your server ID |
| `OWNER_IDS` | Comma-separated user IDs who own the bot |
| `WHITELIST_ROLE_NAME` | Role name that can use commands (default: `Bot Access`) |
| `JAIL_ROLE_NAME` | Role name for the cage (default: `Caged`) |
| `LOG_CHANNEL_ID` | Channel ID for cage/strip logs |

### 4. Set up your Discord server
1. Create a role called `Caged` — only give it access to a `#jail` channel
2. Create a role called `Bot Access` — give it to your mods
3. Make sure the bot's role is **above** the `Caged` role in Server Settings → Roles
4. Go to [discord.com/developers](https://discord.com/developers/applications) → your app → Bot → enable **Server Members Intent**

### 5. Register slash commands
Run once (locally or Railway shell):
```
node src/deploy.js
```

---

## Commands

| Command | Description |
|---|---|
| `/say` | Bot sends a formatted embed — pick title, color, channel |
| `/role @user @role` | Give a role |
| `/unrole @user @role` | Remove a role |
| `/kick @user` | Kick with reason (DMs user first) |
| `/mute @user` | Timeout: 60s / 5m / 10m / 30m / 1h / 6h / 12h / 1d / 3d / 7d |
| `/unmute @user` | Remove timeout |
| `/cage @user` | Assign jail role + logs it |
| `/uncage @user` | Release from cage + logs it |
| `/strip @user` | ⚡ Strips all roles + cages instantly + logs everything |
