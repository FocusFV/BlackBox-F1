export type Round = {
    name: string;
    countryName: string;
    countryKey: null;
    meetingKey: number; // 🔑 Clave esencial para OpenF1
    start: string;
    end: string;
    sessions: Session[];
    over: boolean;
};

export type Session = {
    kind: string;
    start: string;
    end: string;
};