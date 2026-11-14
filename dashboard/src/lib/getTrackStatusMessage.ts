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

export const getTrackStatusMessage = (statusCode: number | undefined, language?: string): StatusMessage | null => {
    const isEn = language === "en";
    const isPt = language === "pt";

    const messageMap: MessageMap = {
        1: { 
            message: isEn ? "Track Clear" : isPt ? "Pista Livre" : "Pista Libre", 
            color: "bg-emerald-500", 
            trackColor: "stroke-white", 
            hex: "#34b981" 
        },
        2: {
            message: isEn ? "Yellow Flag" : isPt ? "Bandeira Amarela" : "Bandera Amarilla",
            color: "bg-amber-400",
            trackColor: "stroke-amber-400",
            bySector: true,
            hex: "#fbbf24",
        },
        3: { 
            message: isEn ? "Flag" : isPt ? "Bandeira" : "Bandera", 
            color: "bg-amber-400", 
            trackColor: "stroke-amber-400", 
            bySector: true, 
            hex: "#fbbf24" 
        },
        4: { 
            message: "Safety Car", 
            color: "bg-amber-400", 
            trackColor: "stroke-amber-400", 
            hex: "#fbbf24" 
        },
        5: { 
            message: isEn ? "Red Flag" : isPt ? "Bandeira Vermelha" : "Bandera Roja", 
            color: "bg-red-500", 
            trackColor: "stroke-red-500", 
            hex: "#ef4444" 
        },
        6: { 
            message: isEn ? "VSC Deployed" : isPt ? "VSC Acionado" : "VSC Desplegado", 
            color: "bg-amber-400", 
            trackColor: "stroke-amber-400", 
            hex: "#fbbf24" 
        },
        7: { 
            message: isEn ? "VSC Ending" : isPt ? "VSC Terminando" : "VSC Finalizando", 
            color: "bg-amber-400", 
            trackColor: "stroke-amber-400", 
            hex: "#fbbf24" 
        },
    };

    return statusCode ? (messageMap[statusCode] ?? messageMap[0]) : null;
};
