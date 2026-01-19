import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { usePokemonInfiniteList } from "../../hooks/use-poke"; // Use infinite hook
import PokeList from "../../components/pokemon/poke-list";

export default function PokemonListScreen() {
  const [search, setSearch] = useState("");
  const ITEMS_PER_PAGE = 50;

  // Use infinite query hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePokemonInfiniteList(ITEMS_PER_PAGE);

  const allPokemon = data?.pages.flatMap((page) => 
    page.results.map((pokemon, index) => {
      const urlParts = pokemon.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 2]) || 
                  (page.page - 1) * ITEMS_PER_PAGE + index + 1;
      
      return {
        id,
        name: pokemon.name,
        sprites: {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        }
      };
    })
  ) || [];

  const filteredPokemon = allPokemon.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && allPokemon.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="pink" />
        <Text style={styles.loadingText}>Loading your Pokédex...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading Pokémon</Text>
        <Text style={styles.errorDetail}>{error?.message || "Unknown error"}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search Pokémon by name or ID..."
            placeholderTextColor="gray"
          />
        </View>
      </View>

      <Text style={styles.subtitle}>All Pokemon ({allPokemon.length})</Text>
      
      <PokeList
        pokemonList={filteredPokemon}
        isLoading={isLoading && allPokemon.length === 0}
        error={isError ? error : undefined}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        emptyMessage={
          search ? `No Pokémon found for "${search}"` : "No Pokémon available"
        }
        // Add these new props for infinite scroll
        onLoadMore={handleLoadMore}
        isFetchingMore={isFetchingNextPage}
        hasMore={hasNextPage}
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
    color: "gray",
  },
  errorText: {
    fontSize: 18,
    color: "tomato",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "dodgerblue",
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "whitesmoke",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
    color: "black",
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "pink",
    marginBottom: 16,
    textAlign: "left",
    paddingHorizontal: 20,
  },
  debugInfo: {
    padding: 10,
    backgroundColor: "whitesmoke",
    borderTopWidth: 1,
    borderTopColor: "lightgray",
  },
  debugText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
});
