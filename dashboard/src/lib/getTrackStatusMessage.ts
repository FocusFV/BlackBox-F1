type StatusMessage = {
    message: string;
    color: string;
    trackColor: string;
    bySector?: boolean;
    pulse?: number;
    hex: string;
};

type MessageMap = {
    [key: string]: StatusMessage;
};

export const getTrackStatusMessage = (statusCode: number | undefined): StatusMessage | null => {
    const messageMap: MessageMap = {
        1: { message: "Pista Libre", color: "bg-emerald-500", trackColor: "stroke-white", hex: "#34b981" },
        2: {
            message: "Bandera Amarilla",
            color: "bg-amber-400",
            trackColor: "stroke-amber-400",
            bySector: true,
            hex: "#fbbf24",
        },
        3: { message: "Bandera", color: "bg-amber-400", trackColor: "stroke-amber-400", bySector: true, hex: "#fbbf24" },
        4: { message: "Auto de Seguridad", color: "bg-amber-400", trackColor: "stroke-amber-400", hex: "#fbbf24" },
        5: { message: "Bandera Roja", color: "bg-red-500", trackColor: "stroke-red-500", hex: "#ef4444" },
        6: { message: "VSC Desplegado", color: "bg-amber-400", trackColor: "stroke-amber-400", hex: "#fbbf24" },
        7: { message: "VSC Finalizando", color: "bg-amber-400", trackColor: "stroke-amber-400", hex: "#fbbf24" },
    };

    return statusCode ? (messageMap[statusCode] ?? messageMap[0]) : null;
};