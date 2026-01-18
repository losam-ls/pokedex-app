import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useFavouritesWithDetails,
  useClearFavourites,
} from "@/hooks/use-favourites";
import PokeList from "@/components/pokemon/poke-list";
import { Trash2 } from "lucide-react-native";

export default function FavouritesScreen() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: favourites,
    isLoading,
    error,
    refetch,
  } = useFavouritesWithDetails();

  const clearFavourites = useClearFavourites();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Favourites",
      "Are you sure you want to remove all Pokémon from your favourites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearFavourites.mutate(),
        },
      ],
    );
  };

  const transformedFavourites =
    favourites?.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      sprites: {
        front_default: pokemon.sprites.front_default,
      },
    })) || [];

  const filteredFavourites = transformedFavourites.filter(
    (pokemon) =>
      pokemon.name.toLowerCase().includes(search.toLowerCase()) ||
      pokemon.id.toString().includes(search),
  );

  if (isLoading && !favourites) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="pink" />
        <Text style={styles.loadingText}>Loading favourites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading favourites</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Favourites</Text>
          {transformedFavourites.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.clearButton}
            >
              <Trash2 size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {transformedFavourites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Favourites Yet</Text>
        </View>
      ) : (

        <PokeList
          pokemonList={filteredFavourites}
          isLoading={isLoading}
          error={error || undefined}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyMessage={
            search ? `No favourites match "${search}"` : "No favourites found"
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "grey",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "grey",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "blue",
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "pink",
  },
  clearButton: {
    padding: 8,
  },
  stats: {
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: "black",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
  },
});
