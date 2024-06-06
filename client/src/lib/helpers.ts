/**
 * Contains helper methods to be used on Client-side
 */

// A simpler fetch() method
interface RequestOptions {
    method: "POST" | "GET" | "PUT" | "DELETE";
    body?: string;
    headers?: any;
    credentials?: RequestCredentials | undefined;
}

export async function F({
    endpoint,
    method = "GET",
    body,
    headers = {},
    extra = {},
    credentials = "include",
}: RequestOptions & {
    endpoint: string;
    extra?: any;
    body?: any;
}) {
    return new Promise((resolve, reject) => {
        if (!headers?.["Content-Type"]) headers["Content-Type"] = "application/json";

        const options: RequestOptions = {
            method,
            headers,
            ...extra,
        };

        if (body) options["body"] = JSON.stringify(body);
        if (credentials) options["credentials"] = "include";

        fetch(process.env.REACT_APP_API + endpoint, options)
            .then(res => res.json())
            .then(res => resolve(res))
            .catch(err => reject(err));
    });
}

// Returns a truncated wallet address
export function truncateWalletAddress(
    walletAddress: string,
    prefixLength = 12,
    suffixLength = 6
): string {
    // Check if the wallet address is valid
    if (typeof walletAddress !== "string" || walletAddress.length < prefixLength + suffixLength)
        return walletAddress; // Return the original address if it's invalid or too short

    // Extract the prefix and suffix parts of the address
    const prefix = walletAddress.substring(0, prefixLength);
    const suffix = walletAddress.substring(walletAddress.length - suffixLength);

    // Generate the truncated address with prefix, ellipsis, and suffix
    const truncatedAddress = `${prefix}...${suffix}`;

    return truncatedAddress;
}
