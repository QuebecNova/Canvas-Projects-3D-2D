export abstract class Singleton {
    abstract id: string
    private static instances: Singleton[] = []
    abstract findOne: (id: string) => Singleton | undefined
}
