
import { WeatherData } from "../types";

/**
 * Motor de Clima Sintético para Piracicaba - SP
 * Gera dados climáticos baseados em médias históricas, horário e mês,
 * eliminando a necessidade de APIs externas e evitando erros de cota.
 */
export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData | null> => {
  // Simulamos um pequeno delay para manter a sensação de "carregamento"
  await new Promise(resolve => setTimeout(resolve, 600));

  const now = new Date();
  const month = now.getMonth(); // 0-11
  const hour = now.getHours(); // 0-23

  // 1. Médias de temperatura para Piracicaba por mês (Média de máximas)
  // Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez
  const monthlyAverages = [30, 31, 30, 28, 25, 24, 25, 27, 28, 29, 30, 30];
  const baseTemp = monthlyAverages[month];

  // 2. Curva de temperatura baseada na hora (Sine Wave)
  // O ponto mais frio é às 5h, o mais quente às 15h
  const timeFactor = Math.sin((hour - 9) * (Math.PI / 12)); 
  const variation = timeFactor * 6; // Flutuação de até 6 graus durante o dia

  // 3. Adicionar aleatoriedade (±2 graus) para não ser sempre igual
  const randomness = (Math.random() * 4) - 2;

  const finalTemp = Math.round(baseTemp + variation + randomness);

  // 4. Determinar condição baseada na temperatura e probabilidade
  let condition = "Céu Limpo";
  if (finalTemp > 28 && Math.random() > 0.7) condition = "Parcialmente Nublado";
  if (finalTemp < 22 && Math.random() > 0.6) condition = "Nublado";
  if (Math.random() > 0.9) condition = "Chuva Leve"; // 10% de chance de chuva aleatória

  // 5. Umidade (Inversamente proporcional à temperatura em Pira)
  const humidity = Math.round(85 - (timeFactor * 30) + randomness);

  return {
    temperature: finalTemp,
    condition: condition,
    humidity: `${humidity}%`,
    feelsLike: finalTemp + (humidity > 70 ? 2 : 0),
    sourceUrl: undefined // Removido pois agora é processamento local
  };
};
