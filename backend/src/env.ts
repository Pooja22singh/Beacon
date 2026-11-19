// Fail fast at startup instead of running with a missing secret
export const requireEnv = (name: string): string => {
    const value = process.env[name]
    if (!value) throw new Error(`${name} is required`)
    return value
}
