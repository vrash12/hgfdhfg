// types/paho-mqtt.d.ts
declare module 'paho-mqtt' {
  interface Message {
    payloadString?: string;
    payloadBytes?: ArrayBuffer | Uint8Array;
  }
}
