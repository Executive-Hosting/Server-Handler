import Discord from "./modules/discord/discord";
import Handler from "./modules/handler";
import Cache from "./utils/cache";

await Cache.Init();
await Handler.Init();
await Discord.Init();
