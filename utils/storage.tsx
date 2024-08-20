import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@players";
const POSITIONS_STORAGE_KEY = "@positions";

interface Player {
  id: number;
  name: string;
  number: number;
  fav_position: string;
  current_position: string;
}

const getPlayers = async (): Promise<Player[]> => {
  try {
    const playersJson = await AsyncStorage.getItem(STORAGE_KEY);
    return playersJson ? JSON.parse(playersJson) : [];
  } catch (error) {
    console.error("Error getting players:", error);
    return [];
  }
};

const savePlayers = async (players: Player[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error("Error saving players:", error);
  }
};

export const saveNewPlayer = async (newPlayer: Player): Promise<void> => {
  const players = await getPlayers();
  players.push(newPlayer);
  await savePlayers(players);
};

export const updatePlayer = async (
  updatedPlayer: Partial<Player> & { id: number }
): Promise<boolean> => {
  const players = await getPlayers();
  const index = players.findIndex((player) => player.id === updatedPlayer.id);
  if (index !== -1) {
    players[index] = { ...players[index], ...updatedPlayer };
    await savePlayers(players);
    return true;
  }
  return false;
};

export const deletePlayer = async (playerId: number): Promise<boolean> => {
  const players = await getPlayers();
  const filteredPlayers = players.filter((player) => player.id !== playerId);
  if (filteredPlayers.length < players.length) {
    await savePlayers(filteredPlayers);
    return true;
  }
  return false;
};

export const getAllPlayers = async (): Promise<Player[]> => {
  return await getPlayers();
};

export const savePositions = async (
  positions: Record<string, number | null>
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      POSITIONS_STORAGE_KEY,
      JSON.stringify(positions)
    );
  } catch (error) {
    console.error("Error saving positions:", error);
  }
};

export const getPositions = async (): Promise<
  Record<string, number | null>
> => {
  try {
    const positionsJson = await AsyncStorage.getItem(POSITIONS_STORAGE_KEY);
    return positionsJson ? JSON.parse(positionsJson) : {};
  } catch (error) {
    console.error("Error getting positions:", error);
    return {};
  }
};
