import { Pokemon, PokemonSpecies, PokemonStat } from "@/constants/pokemon";
import { capitalize } from "@/utils/string-helpers";
import { getTypeColor } from "@/utils/type-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface PokeDetailsProps {
  pokemon: Pokemon;
  species?: PokemonSpecies;
  isFavourite: boolean;
  isFavouriteLoading: boolean;
  onGoBack: () => void;
  onToggleFavourite: () => void;
}

type TabType = "about" | "stats" | "evolutions";

const PokeDetails: React.FC<PokeDetailsProps> = ({
  pokemon,
  species,
  isFavourite,
  isFavouriteLoading,
  onGoBack,
  onToggleFavourite,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const primaryType = pokemon.types[0]?.type.name || "normal";
  const primaryColor = getTypeColor(primaryType);
  const imageUrl =
    pokemon.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const renderNavBar = () => (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleFavourite}
        disabled={isFavouriteLoading}
        style={styles.favouriteButton}
      >
        {isFavouriteLoading ? (
          <ActivityIndicator size="small" color="#FF6B6B" />
        ) : (
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={24}
            color={isFavourite ? "#FF6B6B" : "#333"}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>
        <Text style={styles.pokemonId}>
          #{pokemon.id.toString().padStart(3, "0")}
        </Text>
      </View>

      {/* Pokémon Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(["about", "stats", "evolutions"] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && [
              styles.activeTab,
              { borderBottomColor: primaryColor },
            ],
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && [
                styles.activeTabText,
                { color: primaryColor },
              ],
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Name:</Text>
        <Text style={styles.detailValue}>{capitalize(pokemon.name)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>ID:</Text>
        <Text style={styles.detailValue}>
          #{pokemon.id.toString().padStart(3, "0")}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Base Experience:</Text>
        <Text style={styles.detailValue}>
          {pokemon.base_experience || "N/A"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Weight:</Text>
        <Text style={styles.detailValue}>{pokemon.weight / 10} kg</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Height:</Text>
        <Text style={styles.detailValue}>{pokemon.height / 10} m</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Types:</Text>
        <View style={styles.typeContainer}>
          {pokemon.types.map((typeInfo, index) => (
            <View
              key={index}
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeColor(typeInfo.type.name) },
              ]}
            >
              <Text style={styles.typeText}>
                {capitalize(typeInfo.type.name)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Abilities:</Text>
        <View style={styles.abilitiesContainer}>
          {pokemon.abilities.map((ability, index) => (
            <View key={index} style={styles.abilityBadge}>
              <Text style={styles.abilityText}>
                {capitalize(ability.ability.name.replace("-", " "))}
                {ability.is_hidden && (
                  <Text style={styles.hiddenAbilityText}> (Hidden)</Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStatsTab = () => {
    const statColors: Record<string, string> = {
      hp: "#FF5959",
      attack: "#F5AC78",
      defense: "#FAE078",
      "special-attack": "#9DB7F5",
      "special-defense": "#A7DB8D",
      speed: "#FA92B2",
    };

    return (
      <View style={styles.tabContent}>
        {pokemon.stats.map((stat: PokemonStat, index: number) => {
          const statName = stat.stat.name;
          const statValue = stat.base_stat;
          const maxStat = 255; // Max stat value in Pokémon
          const percentage = (statValue / maxStat) * 100;

          return (
            <View key={index} style={styles.statRow}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>
                  {capitalize(statName.replace("-", " "))}:
                </Text>
                <Text style={styles.statValue}>{statValue}</Text>
              </View>

              <View style={styles.statBarContainer}>
                <View
                  style={[
                    styles.statBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: statColors[statName] || primaryColor,
                    },
                  ]}
                />
                <View style={styles.statBarBackground} />
              </View>
            </View>
          );
        })}

        <View style={styles.totalStatRow}>
          <Text style={styles.totalStatLabel}>Total:</Text>
          <Text style={styles.totalStatValue}>
            {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEvolutionsTab = () => {
    const evolutions = [
      { id: 1, name: "bulbasaur" },
      { id: 2, name: "ivysaur" },
      { id: 3, name: "venusaur" },
    ];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.evolutionTitle}>Evolution Chain</Text>

        <View style={styles.evolutionContainer}>
          {evolutions.map((evolution, index) => (
            <View key={evolution.id} style={styles.evolutionItem}>
              <View style={styles.evolutionCard}>
                <Image
                  source={{
                    uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`,
                  }}
                  style={styles.evolutionImage}
                  resizeMode="contain"
                />
                <View style={styles.evolutionInfoContainer}>
                  <Text style={styles.evolutionName}>
                    {capitalize(evolution.name)}
                  </Text>
                  <Text style={styles.evolutionId}>
                    #{evolution.id.toString().padStart(3, "0")}
                  </Text>
                </View>
              </View>

              {index < evolutions.length - 1 && (
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-down" size={24} color="#999" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderNavBar()}
      {renderHeader()}
      {renderTabs()}
      <ScrollView style={styles.contentContainer}>
        {activeTab === "about" && renderAboutTab()}
        {activeTab === "stats" && renderStatsTab()}
        {activeTab === "evolutions" && renderEvolutionsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
    color: "#333",
    fontWeight: "500",
  },
  favouriteButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f9f9f9",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  pokemonId: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666",
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pokemonImage: {
    width: 180,
    height: 180,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#999",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  abilitiesContainer: {
    flex: 1,
    gap: 8,
  },
  abilityBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  abilityText: {
    color: "#666",
    fontSize: 14,
  },
  hiddenAbilityText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },
  statRow: {
    marginBottom: 20,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  statBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  statBar: {
    height: "100%",
    borderRadius: 6,
    position: "relative",
    zIndex: 1,
  },
  totalStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalStatLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  evolutionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  evolutionContainer: {
    gap: 16,
  },
  evolutionItem: {
    alignItems: "center",
  },
  evolutionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  evolutionImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  evolutionInfoContainer: {
    flex: 1,
  },
  evolutionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  evolutionId: {
    fontSize: 14,
    color: "#666",
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  evolutionLevel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  evolutionNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
});

export default PokeDetails;
