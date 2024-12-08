import { getEnvVariable} from "./util.ts";


export const apiKey = getEnvVariable("FAL_KEY");
if (!apiKey) throw new Error("FAL_KEY not found.");
