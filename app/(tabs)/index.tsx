import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getAllPlayers, saveNewPlayer } from "@/utils/storage";
import { Player, initialPlayers } from "@/data/initialPlayers";

export default BaseballField = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);
  const [positions, setPositions] = useState({
    pitcher: "John",
    catcher: "Mike",
    firstBase: "Alex",
    secondBase: "Sarah",
    thirdBase: "Emily",
    shortStop: "David",
    leftField: "Tom",
    centerField: "Lisa",
    rightField: "Mark",
  });

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

  const { width, height } = Dimensions.get("window");
  const fieldHeight = height * 0.5; // 50% of screen height
  const fieldWidth = width;

  const playerRenderItem = ({ index, item }) => {
    return (
      <View key={index} style={[styles.listPlayers]}>
        <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>{item.number}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>{item.fav_position}</Text>
        <Text style={{ width: 60, fontSize: 16 }}>{item.current_position}</Text>
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
            {!positions.pitcher ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.pitcher, styles.playerName]}
              >
                {positions.pitcher}
              </Text>
            )}
            {!positions.catcher ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.catcher, styles.playerName]}
              >
                {positions.catcher}
              </Text>
            )}
            {!positions.firstBase ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.firstBase, styles.playerName]}
              >
                {positions.firstBase}
              </Text>
            )}
            {!positions.secondBase ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.secondBase, styles.playerName]}
              >
                {positions.secondBase}
              </Text>
            )}
            {!positions.thirdBase ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.thirdBase, styles.playerName]}
              >
                {positions.thirdBase}
              </Text>
            )}
            {!positions.shortStop ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.shortStop, styles.playerName]}
              >
                {positions.shortStop}
              </Text>
            )}
            {!positions.leftField ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.leftField, styles.playerName]}
              >
                {positions.leftField}
              </Text>
            )}
            {!positions.rightField ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.rightField, styles.playerName]}
              >
                {positions.rightField}
              </Text>
            )}
            {!positions.centerField ? (
              ""
            ) : (
              <Text
                style={[styles.position, styles.centerField, styles.playerName]}
              >
                {positions.centerField}
              </Text>
            )}
          </View>
        </View>
        <View
          style={{ ...styles.container, backgroundColor: "white", padding: 16 }}
        >
          <Text style={styles.title}>Players</Text>
          {/* <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          /> */}
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
  playerName: {
    fontWeight: "bold",
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
  position: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 5,
    borderRadius: 5,
  },
  pitcher: {
    top: "70%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -10 }],
  },
  catcher: { bottom: "3%", left: "50%", transform: [{ translateX: -25 }] },
  firstBase: { bottom: "30%", right: "20%" },
  secondBase: { top: "45%", left: "64%", transform: [{ translateX: -25 }] },
  thirdBase: { bottom: "30%", left: "20%" },
  shortStop: { top: "45%", left: "28%" },
  leftField: { top: "24%", left: "3%" },
  centerField: { top: "12%", left: "51%", transform: [{ translateX: -25 }] },
  rightField: { top: "24%", right: "5%" },
  separator: {
    height: 1,
    backgroundColor: "#CED0CE", // You can customize the color
    marginHorizontal: 2, // Optional: add margin if needed
  },
});
