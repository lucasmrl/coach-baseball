import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAllPlayers,
  saveNewPlayer,
  updatePlayer,
  savePositions,
  getPositions,
} from "@/utils/storage";
import { Player, initialPlayers } from "@/data/initialPlayers";

export default BaseballField = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState({
    pitcher: null,
    catcher: null,
    firstBase: null,
    secondBase: null,
    thirdBase: null,
    shortStop: null,
    leftField: null,
    centerField: null,
    rightField: null,
  });

  const [dropdownStates, setDropdownStates] = useState({
    pitcher: false,
    catcher: false,
    firstBase: false,
    secondBase: false,
    thirdBase: false,
    shortStop: false,
    leftField: false,
    centerField: false,
    rightField: false,
  });

  const positionAbbreviations = {
    pitcher: "P",
    catcher: "C",
    firstBase: "1B",
    secondBase: "2B",
    thirdBase: "3B",
    shortStop: "SS",
    leftField: "LF",
    centerField: "CF",
    rightField: "RF",
  };

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

  const loadPositionsAndPlayers = useCallback(async () => {
    setIsLoading(true);
    const [storedPlayers, storedPositions] = await Promise.all([
      getAllPlayers(),
      getPositions(),
    ]);

    if (storedPlayers.length === 0) {
      for (const player of initialPlayers) {
        await saveNewPlayer(player);
      }
      storedPlayers = initialPlayers;
    }

    setPlayers(storedPlayers);
    setPositions((prevPositions) => ({
      ...prevPositions,
      ...storedPositions,
    }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPositionsAndPlayers();
  }, [loadPositionsAndPlayers]);

  const handlePlayerSelect = async (newPosition, playerId) => {
    const updatedPositions = { ...positions };

    // Clear the previous position if the player is already assigned to a position
    let previousPosition = null;
    for (const position in updatedPositions) {
      if (updatedPositions[position] === playerId) {
        previousPosition = position;
        break;
      }
    }

    if (previousPosition && previousPosition !== newPosition) {
      updatedPositions[previousPosition] = null;
      const previousPlayer = players.find((p) => p.id === playerId);
      if (previousPlayer) {
        await updatePlayer({
          ...previousPlayer,
          current_position: "",
        });
      }
    }

    // If the new position is "Select" (null), clear the player's current_position
    if (playerId === null) {
      const playerToClear = players.find(
        (p) => p.id === updatedPositions[newPosition]
      );
      if (playerToClear) {
        await updatePlayer({
          ...playerToClear,
          current_position: "",
        });
      }
      updatedPositions[newPosition] = null; // Clear the position in the state
    } else {
      // Set the new position if a valid player is selected
      updatedPositions[newPosition] = playerId;
      const playerToUpdate = players.find((p) => p.id === playerId);
      if (playerToUpdate) {
        const positionAbbreviation = positionAbbreviations[newPosition];
        await updatePlayer({
          ...playerToUpdate,
          current_position: positionAbbreviation,
        });
      }
    }

    setPositions(updatedPositions);
    await savePositions(updatedPositions);

    loadPositionsAndPlayers(); // Reload players and positions to reflect the changes
  };

  const renderDropdown = (position) => {
    if (
      position == "catcher" ||
      position == "pitcher" ||
      position == "firstBase" ||
      position == "thirdBase"
    ) {
      return (
        <DropDownPicker
          dropDownDirection="TOP"
          selectedItemLabelStyle={{
            fontWeight: "bold",
          }}
          showArrowIcon={true}
          placeholder="Select"
          open={dropdownStates[position]}
          value={positions[position]}
          items={[
            { label: "Select", value: null },
            ...players.map((player) => ({
              label: player.name,
              value: player.id,
            })),
          ]}
          setOpen={(open) =>
            setDropdownStates((prev) => ({ ...prev, [position]: open }))
          }
          setValue={(callback) => {
            setPositions((prev) => ({
              ...prev,
              [position]: callback(prev[position]),
            }));
          }}
          onSelectItem={(item) => handlePlayerSelect(position, item.value)}
          style={[styles.dropdown, styles[`${position}Dropdown`]]}
          containerStyle={[
            styles.dropdownContainer,
            styles[`${position}Dropdown`],
          ]}
          zIndex={1000 - Object.keys(positions).indexOf(position)}
        />
      );
    } else {
      return (
        <DropDownPicker
          showArrowIcon={true}
          selectedItemLabelStyle={{
            fontWeight: "bold",
          }}
          placeholder="Select"
          open={dropdownStates[position]}
          value={positions[position]}
          items={[
            { label: "Select", value: null },
            ...players.map((player) => ({
              label: player.name,
              value: player.id,
            })),
          ]}
          setOpen={(open) =>
            setDropdownStates((prev) => ({ ...prev, [position]: open }))
          }
          setValue={(callback) => {
            setPositions((prev) => ({
              ...prev,
              [position]: callback(prev[position]),
            }));
          }}
          onSelectItem={(item) => handlePlayerSelect(position, item.value)}
          style={[styles.dropdown, styles[`${position}Dropdown`]]}
          containerStyle={[
            styles.dropdownContainer,
            styles[`${position}Dropdown`],
          ]}
          zIndex={1000 + Object.keys(positions).indexOf(position)}
          zIndexInverse={1000 - Object.keys(positions).indexOf(position)}
        />
      );
    }
  };

  const { width, height } = Dimensions.get("window");
  const fieldHeight = height * 0.5; // 50% of screen height
  const fieldWidth = width;

  const playerRenderItem = ({ item }: { item: Player }) => {
    return (
      <View style={styles.listPlayers}>
        <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>{item.number}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>{item.fav_position}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>
          {item.current_position}
          {item.fav_position === item.current_position && " ✅"}
        </Text>
      </View>
    );
  };

  const Separator = () => <View style={styles.separator} />;

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 0, backgroundColor: "#038934" }}
      />
      <SafeAreaView
        edges={["left", "right"]}
        style={{
          flex: 1,
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        <View
          style={[
            styles.fieldContainer,
            { height: fieldHeight, width: fieldWidth },
          ]}
        >
          <Image
            source={require("../../assets/images/fields.png")}
            style={styles.fieldImage}
          />
          <View style={styles.positionsContainer}>
            {renderDropdown("pitcher")}
            {renderDropdown("catcher")}
            {renderDropdown("firstBase")}
            {renderDropdown("secondBase")}
            {renderDropdown("thirdBase")}
            {renderDropdown("shortStop")}
            {renderDropdown("leftField")}
            {renderDropdown("centerField")}
            {renderDropdown("rightField")}
          </View>
        </View>
        <View
          style={{ ...styles.container, backgroundColor: "white", padding: 16 }}
        >
          <Text style={styles.title}>Players</Text>
          <View
            style={{
              flexDirection: "row",
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold" }}>
              Name
            </Text>
            <Text style={{ width: 60, fontSize: 14, fontWeight: "bold" }}>
              #
            </Text>
            <Text style={{ width: 60, fontSize: 14, fontWeight: "bold" }}>
              Fav. Pos.
            </Text>
            <Text style={{ width: 60, fontSize: 14, fontWeight: "bold" }}>
              Current Pos.
            </Text>
          </View>
          <FlashList
            data={players}
            renderItem={playerRenderItem}
            estimatedItemSize={200}
            ItemSeparatorComponent={Separator}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#038934",
  },
  listPlayers: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    paddingBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
  },
  fieldContainer: {
    position: "relative",
  },
  fieldImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  positionsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  separator: {
    height: 1,
    backgroundColor: "#CED0CE",
    marginHorizontal: 2,
    marginBottom: 10,
  },
  dropdown: {
    width: 120,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 5,
    borderWidth: 0,
  },
  dropdownContainer: {
    width: 120,
    position: "absolute",
  },
  pitcherDropdown: {
    top: "60%",
    left: "60%",
    transform: [{ translateX: -60 }, { translateY: -20 }],
  },
  catcherDropdown: {
    bottom: "3%",
    left: "60%",
    transform: [{ translateX: -60 }],
  },
  firstBaseDropdown: {
    bottom: "25%",
    right: "2%",
  },
  secondBaseDropdown: {
    top: "30%",
    left: "84%",
    transform: [{ translateX: -60 }],
  },
  thirdBaseDropdown: {
    bottom: "25%",
    left: "2%",
  },
  shortStopDropdown: {
    top: "30%",
    left: "5%",
  },
  leftFieldDropdown: {
    top: "15%",
    left: "1%",
  },
  centerFieldDropdown: {
    top: "5%",
    left: "59%",
    transform: [{ translateX: -60 }],
  },
  rightFieldDropdown: {
    top: "15%",
    right: "1%",
  },
});
