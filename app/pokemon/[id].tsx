import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { usePokemonWithDetails } from "@/hooks/use-poke";
import { useFavouriteStatus, useToggleFavourite } from "@/hooks/use-favourites";
import PokeDetails from "@/components/pokemon/poke-details";

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { pokemon, species, isLoading, isError, error } =
    usePokemonWithDetails(id);

  const { data: isFavourite, isLoading: isFavouriteLoading } =
    useFavouriteStatus(pokemon?.id || 0);

  const toggleFavourite = useToggleFavourite();

  const handleGoBack = () => {
    router.back();
  };

  const handleToggleFavourite = () => {
    if (!pokemon) return;

    toggleFavourite.mutate({
      pokemonId: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.front_default || undefined,
      isCurrentlyFavourite: isFavourite || false,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !pokemon) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading Pokémon</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || "Please try again"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <PokeDetails
          pokemon={pokemon}
          species={species}
          isFavourite={isFavourite || false}
          isFavouriteLoading={isFavouriteLoading}
          onGoBack={handleGoBack}
          onToggleFavourite={handleToggleFavourite}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
