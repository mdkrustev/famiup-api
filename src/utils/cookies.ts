export const readCookies = (request: Request, name: string | null = null) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
            const [key, ...v] = c.trim().split("=");
            return [key, v.join("=")];
        })
    );
    if (name)
        return cookies[name] || null
    return cookies;
}