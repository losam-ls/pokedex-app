import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { usePokemonList } from "../../hooks/use-poke";
import PokeList from "../../components/pokemon/poke-list";
import SearchBar from "../../components/ui/search";

export default function PokemonListScreen() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = usePokemonList(20, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const transformedPokemon =
    data?.results?.map((pokemon, index) => {
      const urlParts = pokemon.url.split("/");
      const idString = urlParts[urlParts.length - 2];
      const id = idString ? parseInt(idString) : index + 1;

      return {
        id,
        name: pokemon.name,
        sprites: {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        },
      };
    }) || [];

  const filteredPokemon = transformedPokemon.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading Pokémon</Text>
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
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search Pokémon by name or ID..."
        />
      </View>
      <Text style={styles.subtitle}> All Pokemon</Text>

      <PokeList
        pokemonList={filteredPokemon}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyMessage={
          search ? `No Pokémon found for "${search}"` : "No Pokémon available"
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
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
    textAlign: "center",
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "pink",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "pink",
    marginBottom: 16,
    textAlign: "left",
    paddingHorizontal: 20,
    
  },
});
