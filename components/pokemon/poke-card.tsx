import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Share,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MoreVertical, Star } from "lucide-react-native";
import { useFavouriteStatus, useToggleFavourite } from "@/hooks/use-favourites";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 2;

interface PokeCardProps {
  pokemon: {
    id: number;
    name: string;
    sprites?: {
      front_default: string | null;
    };
  };
  showFavouriteStar?: boolean;
}

export default function PokeCard({
  pokemon,
  showFavouriteStar = false,
}: PokeCardProps) {
  const router = useRouter();
  const { data: isFavourite } = useFavouriteStatus(pokemon.id);
  const toggleFavourite = useToggleFavourite();

  const imageUrl =
    pokemon.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const handleShare = async () => {
    try {
      const shareUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
      const message = `Check out ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}! #${pokemon.id}\n${shareUrl}`;

      await Share.share({
        message,
        title: `Share ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleToggleFavourite = () => {
    toggleFavourite.mutate({
      pokemonId: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites?.front_default || undefined,
      isCurrentlyFavourite: isFavourite || false,
    });
  };

  const handleOpenDetails = () => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  const showOptions = () => {
    if (Platform.OS === "ios") {
      Alert.alert(
        `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`,
        undefined,
        [
          {
            text: "Open Details",
            onPress: handleOpenDetails,
            style: "default",
          },
          {
            text: isFavourite ? "Remove Favourite" : "Add to Favourites",
            onPress: handleToggleFavourite,
            style: "default",
          },
          {
            text: "Share Pokémon",
            onPress: handleShare,
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    } else {
      Alert.alert(
        `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`,
        "Choose an action",
        [
          {
            text: "Open Details",
            onPress: handleOpenDetails,
            style: "default",
          },
          {
            text: isFavourite ? "Remove Favourite" : "Add to Favourites",
            onPress: handleToggleFavourite,
          },
          {
            text: "Share",
            onPress: handleShare,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>
            #{pokemon.id.toString().padStart(3, "0")}
          </Text>
        </View>

        {showFavouriteStar && (
          <TouchableOpacity
            onPress={handleToggleFavourite}
            style={styles.starButton}
          >
            <Star
              size={16}
              color={isFavourite ? "#FFD700" : "#C0C0C0"}
              fill={isFavourite ? "#FFD700" : "transparent"}
            />
          </TouchableOpacity>
        )}
      </View>

      <Link href={`/pokemon/${pokemon.id}`} asChild>
        <TouchableOpacity style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Link>

      <View style={styles.nameRow}>
        <Text style={styles.name} numberOfLines={1}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>

        <TouchableOpacity onPress={showOptions} style={styles.optionsButton}>
          <MoreVertical size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  starButton: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  image: {
    width: CARD_SIZE * 0.6,
    height: CARD_SIZE * 0.6,
    maxWidth: 96,
    maxHeight: 96,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
    flex: 1,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
});
