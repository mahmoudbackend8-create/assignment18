import z from "zod";

export const validationSC = z.object({ meassage: z.string().min(3) });
