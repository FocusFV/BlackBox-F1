// src/config/f1DataInsights.ts

export interface PressNote {
	label: string;
	title: string;
	text: string;
	link: string;
	sourceName: string;
}

export const f1HistoricalDatabase: { [key: string]: PressNote[] } = {
	barcelona: [
		{
			label: "Hito de Leyenda",
			title: "Hamilton emula a Schumacher",
			text: "La primera victoria de Lewis Hamilton con Ferrari se dio exactamente en el mismo circuito de Montmeló donde Michael Schumacher logró su primer triunfo de rojo hace 30 años.",
			link: "https://soymotor.com",
			sourceName: "SoyMotor.com"
		},
		{
			label: "Guerra en Boxes",
			title: "Apuesta de Pirelli",
			text: "La marca italiana tomó un riesgo al llevar neumáticos más blandos de lo habitual, lo que provocó que la degradación física del chasis fuera más protagonista.",
			link: "https://soymotor.com",
			sourceName: "SoyMotor.com"
		},
		{
			label: "Revolución Técnica",
			title: "Nueva Era Aerodinámica",
			text: "Los monoplazas estrenaron motores divididos al 50% entre combustión y energía eléctrica. Los pilotos controlaron el viento mediante dos modos de alerones: Straight Mode y Corner Mode.",
			link: "https://www.lasexta.com",
			sourceName: "LaSexta"
		},
		{
			label: "Archivo Secreto",
			title: "El curioso test secreto de enero",
			text: "Antes del inicio de temporada, los equipos tuvieron unos test inusuales en Barcelona a puerta cerrada. La FIA prohibió las liveries oficiales para no revelar novedades.",
			link: "https://www.instagram.com/fastestlapnews",
			sourceName: "Instagram"
		},
		{
			label: "Futuro del Circuito",
			title: "Doble GP de España en el calendario",
			text: "Barcelona acogió la séptima fecha del calendario, pero este fue su último año como sede fija. El GP de España oficial se trasladó a Madrid y este trazado entra en rotación.",
			link: "https://youtube.com",
			sourceName: "YouTube"
		},
		{
			label: "Internas de Equipo",
			title: "La guerra interna en Mercedes",
			text: "El joven italiano Kimi Antonelli atacó magistralmente a su compañero George Russell en la vuelta 61, antes de que su motor fallara críticamente.",
			link: "https://www.espn.com.mx",
			sourceName: "ESPN México"
		}
	],
	austria: [
		{
			label: "Efecto Altitud",
			title: "Presión en el Spielberg",
			text: "A más de 700 metros sobre el nivel del mar, el aire enrarecido reduce la eficiencia de refrigeración de la unidad de potencia en un 10%, forzando aperturas extra.",
			link: "https://soymotor.com",
			sourceName: "SoyMotor.com"
		},
		{
			label: "Destructor de Chasis",
			title: "Los Pianos Amarillos",
			text: "Las brutales salchichas disuasorias de las curvas 9 y 10 generan vibraciones de alta frecuencia capaces de fisurar los pisos de carbono en solo unas pasadas.",
			link: "https://www.dazn.com",
			sourceName: "DAZN"
		},
		{
			label: "Récord de Giro",
			title: "La Vuelta Más Corta",
			text: "Con solo 10 curvas reales, el Red Bull Ring registra los tiempos de vuelta más rápidos de todo el año, dejando los márgenes de la Qualy metidos en milésimas.",
			link: "https://www.espn.com.mx",
			sourceName: "ESPN"
		},
		{
			label: "Batallas Históricas",
			title: "Límites de pista críticos",
			text: "El diseño del circuito genera una pesadilla para los comisarios de la FIA, llegando a registrarse más de 80 infracciones de límites de pista en una sola carrera.",
			link: "https://youtube.com",
			sourceName: "YouTube"
		}
	],
	silverstone: [
		{
			label: "Fuerza G Extrema",
			title: "El Complejo Maggots-Becketts",
			text: "Los pilotos soportan aceleraciones laterales sostenidas de hasta 5.6G ingresando a más de 290 km/h, exigiendo al límite absoluto las suspensiones.",
			link: "https://www.dazn.com",
			sourceName: "DAZN"
		},
		{
			label: "Cuna del Deporte",
			title: "76 Años de Historia Viva",
			text: "El antiguo aeródromo militar de la Segunda Guerra Mundial sigue siendo el templo definitivo donde el viento cruzado define el balance aerodinámico en Copse.",
			link: "https://soymotor.com",
			sourceName: "SoyMotor.com"
		}
	]
};