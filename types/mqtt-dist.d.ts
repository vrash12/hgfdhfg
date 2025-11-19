// types/mqtt-dist.d.ts
declare module 'paho-mqtt' {
  export class Message {
    constructor(payload: string | ArrayBuffer);
    destinationName: string;
    retained: boolean;
    qos: 0 | 1 | 2;
    payloadBytes: Uint8Array;
  }
  export class Client {
    constructor(host: string, port: number, path: string, clientId: string);
    connect(options: any): void;
    disconnect(): void;
    isConnected(): boolean;
    subscribe(filter: string, options?: any): void;
    send(message: Message): void;
    onMessageArrived?: (message: Message) => void;
    onConnectionLost?: (resp: { errorCode: number; errorMessage?: string }) => void;
  }
}
