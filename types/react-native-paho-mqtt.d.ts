// types/react-native-paho-mqtt.d.ts
declare module "react-native-paho-mqtt" {
  import * as Paho from "paho-mqtt";

  // Storage adapter (usually backed by AsyncStorage)
  export interface MqttStorage {
    setItem(key: string, value: string): Promise<void> | void;
    getItem(key: string): Promise<string | null> | string | null;
    removeItem(key: string): Promise<void> | void;
  }

  export type QoS = 0 | 1 | 2;

  export interface ClientOptions {
    uri: string;
    clientId?: string;
    storage?: MqttStorage;
    keepAliveInterval?: number;
    timeout?: number;
    useSSL?: boolean;
    userName?: string;
    password?: string;
    reconnect?: boolean;
  }

  export class Client {
    constructor(options: ClientOptions);

    connect(opts?: {
      userName?: string;
      password?: string;
      useSSL?: boolean;
      keepAliveInterval?: number;
      timeout?: number;
      onSuccess?: () => void;
      onFailure?: (e: any) => void;
    }): Promise<void>;

    disconnect(): void;

    subscribe(topic: string, opts?: { qos?: QoS }): void;
    unsubscribe(topic: string): void;

    send(message: Paho.Message): void;

    on(event: "connectionLost", cb: (err: any) => void): void;
    on(event: "messageReceived", cb: (msg: Paho.Message) => void): void;
  }

  // Re-export Message so you can import it from this module
  export const Message: typeof Paho.Message;
}
