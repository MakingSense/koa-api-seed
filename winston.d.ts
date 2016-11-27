import {WinstonModuleTrasportInstance} from "winston";

export declare var transports: Transports;

declare module 'winston' {
    interface Transports {
        Logentries: WinstonModuleTrasportInstance;
    }
}
export interface Transports {
    Logentries: WinstonModuleTrasportInstance;
}