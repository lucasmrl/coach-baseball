import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { getAllPlayers, saveNewPlayer, updatePlayer } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { Player, initialPlayers } from "@/data/initialPlayers";

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedNumber, setEditedNumber] = useState("");
  const [editedFavPosition, setEditedFavPosition] = useState("");

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    let storedPlayers = await getAllPlayers();

    if (storedPlayers.length === 0) {
      for (const player of initialPlayers) {
        await saveNewPlayer(player);
      }
      storedPlayers = initialPlayers;
    }

    setPlayers(storedPlayers);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [loadPlayers])
  );

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setEditedName(player.name);
    setEditedNumber(player.number.toString());
    setEditedFavPosition(player.fav_position);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (selectedPlayer) {
      const updatedPlayer: Player = {
        ...selectedPlayer,
        name: editedName,
        number: parseInt(editedNumber, 10),
        fav_position: editedFavPosition,
      };

      await updatePlayer(updatedPlayer);
      await loadPlayers(); // Reload the players list
      setIsModalVisible(false);
    }
  };

  const playerRenderItem = ({ item }: { item: Player }) => {
    return (
      <TouchableOpacity onPress={() => handlePlayerPress(item)}>
        <View style={styles.listPlayers}>
          <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
          <Text style={{ width: 60, fontSize: 16 }}>{item.number}</Text>
          <Text style={{ width: 60, fontSize: 16 }}>{item.fav_position}</Text>
          <Text style={{ width: 60, fontSize: 16 }}>
            {item.current_position}
            {item.fav_position === item.current_position && " ✅"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Separator = () => <View style={styles.separator} />;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading players...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 0, backgroundColor: "white" }}
      />
      <SafeAreaView
        edges={["left", "right"]}
        style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Players</Text>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 1 }]}>Name</Text>
            <Text style={[styles.headerText, { width: 60 }]}>#</Text>
            <Text style={[styles.headerText, { width: 60 }]}>Fav. Pos.</Text>
            <Text style={[styles.headerText, { width: 60 }]}>Current Pos.</Text>
          </View>
          <FlashList
            data={players}
            renderItem={playerRenderItem}
            estimatedItemSize={200}
            ItemSeparatorComponent={Separator}
            keyExtractor={(item) => item.id}
          />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Player</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                value={editedNumber}
                onChangeText={setEditedNumber}
                placeholder="Number"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={editedFavPosition}
                onChangeText={setEditedFavPosition}
                placeholder="Favorite Position"
              />
              <View style={styles.buttonContainer}>
                <Button title="Save" onPress={handleSave} />
                <Button
                  title="Cancel"
                  onPress={() => setIsModalVisible(false)}
                  color="red"
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listPlayers: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    paddingVertical: 18,
  },
  title: {
    fontWeight: "bold",
    fontSize: 36,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#CED0CE",
    marginHorizontal: 2,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default Players;
