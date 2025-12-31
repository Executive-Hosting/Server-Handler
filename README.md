# Executive Hosting MCBE Software Handler
## This tool is used by us to run your server as simple as possible!

**Disclaimers**:
- This requires a Linux machine to be ran on, due to the use of shell scripts.

**Requirements:**
 - 4GB of RAM.
 - 2 threads (The faster the better.)
 - A discord application ready, with it's token and ID.
 - 5GB for installation, but as much space as you need for your backup needs.
 -  Linux packages:
    - bun
    - wget
    - curl
    - unzip
    - git




**Steps to Use:**
1. Install the required packages.
   - ```apt install wget unzip git curl -y```
2. Install the bun cli tool.
   - ```curl -fsSL https://bun.com/install | bash```
3. Clone this repo onto your machine and cd into the directory.
  - ```git clone https://github.com/Executive-Hosting/server-handler.git && cd server-handler```
4. Install the required packages.
  - ```bun install```
5. Open your `.env` file and add the two lines, replacing with your information.
 - DISCORDTOKEN={{YOUR APPLICATION TOKEN}}
 - DISCORDID={{YOUR APPLICATION ID}}
6. Open the `lib/config.json` file and edit to your needs.
 - `show_console` - Will Output the server console into the terminal. | Default: true
 - `server_allowed_role` - The allowed discord role's ID that members must have in order to use the bot. | Required to change!
 - `server_log` - Toggles the ability to log to a channel on your discord server. | Default: true
 - `server_log_speed` - How often the bot will send a embed to the log channel **in seconds**. | Default: 1
 - `server_log_lines` - How many lines it will grab per a embed. | Default: 10
 - `server_log_channel` - The channel the logs will be sent to. | Required to change if `server_log` is enabled.
 - `auto_restart` - Toggles the ability for the server to trigger a reboot sequence. | Default: true
 - `auto_restart_timing` - The timings **in UTC** that you want your server to trigger the reboot sequence. | Required to change if `auto_reboot` is enabled.
   - The timing is in `HH:MM` format.
   - Example: `["08:30", "19:30"]`
 - `auto_restart_countdown_options` - The options that will trigger in order whenever the timing is right. | Required to change if `auto_reboot` is enabled.
   - The reboot will trigger after the last option happens.
   - The options are as follows: 
     - `delay` - The delay **in seconds** until the next option is triggered.
     - `commands` - A array of commands that will run, whenever the current option is triggered.
   - Example: 
     - `[{"delay":1,"commands":["say Server will restart in 1 second!"]},{"delay":1,"commands":["kick @a Server is restarting!"]}]`
7. Start your service!
 - You can run the service manually by doing the following:
   - ```bun start```
 - You can also start the service by using PM2 to fully run in the background.
   - ```bun install -g pm2```
   - Write the following into a file called `start.sh`:
     - ```#!/bin/bash```
     - ```bun start```
   - ```chmod +x start.sh```
   - ```bunx pm2 start --name service ./start.sh```
