export class ErrorHandler {
    static throw(text: string) {
        throw new Error(text)
    }
    static log(text: string) {
        try {
            throw new Error(text)
        } catch (e) {
            console.error(e)
        }
    }
}
