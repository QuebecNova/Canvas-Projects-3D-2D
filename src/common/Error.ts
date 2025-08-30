export class ErrorHandler {
    static throw(text: string) {
        alert(text)
    }
    static log(text: string) {
        try {
            throw new Error(text)
        } catch (e) {
            console.error(e)
        }
    }
}
