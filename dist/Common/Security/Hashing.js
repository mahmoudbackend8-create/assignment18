import { compare, hash } from "bcrypt";
import { ENCRYPTION_KEY, SALT_ROUND } from "../../Config/Config.service.js";
export async function Hashing({ PlainText, SaltRound = SALT_ROUND, }) {
    return await hash(PlainText, SaltRound);
}
export async function Comparing({ PlainText, HashValue, }) {
    return await compare(PlainText, HashValue);
}
