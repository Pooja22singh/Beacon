export const chatErrorMessage = (status: number): string => {
    switch (status) {
        case 429:
            return 'Too many messages. Please wait a minute.'
        case 504:
            return 'That took too long. Please try again.'
        case 0:
            return "Can't reach the server. Check your connection and try again."
        default:
            return 'Something went wrong. Please try again.'
    }
}
