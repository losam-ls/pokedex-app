import React from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import PokeCard from "./poke-card";

interface PokeListProps {
  pokemonList: Array<{
    id: number;
    name: string;
    sprites?: { front_default: string | null };
  }>;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
}

export default function PokeList({
  pokemonList,
  isLoading = false,
  error = null,
  onRefresh,
  refreshing = false,
  emptyMessage = "No Pokémon found",
}: PokeListProps) {
  console.log("🔄 PokeList rendering with", pokemonList.length, "pokemon");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
        <Text>Loading Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading Pokémon</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={pokemonList}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PokeCard pokemon={item} />}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["red"]}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>{emptyMessage}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 8,
  },
});
