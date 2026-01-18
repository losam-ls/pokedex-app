import { Pokemon, PokemonSpecies, PokemonStat } from "@/constants/pokemon";
import { capitalize } from "@/utils/string-helpers";
import { getTypeColor } from "@/utils/type-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { PokeApiService } from "@/services/poke-api";

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

interface EvolutionStage {
  id: number;
  name: string;
  level?: number;
  trigger?: string;
  sprite: string;
}

const PokeDetails: React.FC<PokeDetailsProps> = ({
  pokemon,
  species,
  isFavourite,
  isFavouriteLoading,
  onGoBack,
  onToggleFavourite,
}) => {

  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [evolutionStages, setEvolutionStages] = useState<EvolutionStage[]>([]);
  const [isLoadingEvolutions, setIsLoadingEvolutions] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const primaryType = pokemon.types[0]?.type.name || "normal";
  const primaryColor = getTypeColor(primaryType);
  const imageUrl =
    pokemon.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  useEffect(() => {
    const fetchEvolutionChain = async () => {
      if (!species?.evolution_chain?.url) {
        setEvolutionError("No evolution data available");
        return;
      }

      setIsLoadingEvolutions(true);
      setEvolutionError(null);

      try {
        const urlParts = species.evolution_chain.url.split("/");
        const chainId = parseInt(urlParts[urlParts.length - 2]);

        const evolutionChain =
          await PokeApiService.getEvolutionChainById(chainId);
        const stages: EvolutionStage[] = [];

        const extractEvolutions = (chainLink: any, level: number = 0) => {
          const speciesUrlParts = chainLink.species.url.split("/");
          const pokemonId = parseInt(
            speciesUrlParts[speciesUrlParts.length - 2],
          );

          stages.push({
            id: pokemonId,
            name: chainLink.species.name,
            level: chainLink.evolution_details?.[0]?.min_level || level,
            trigger: chainLink.evolution_details?.[0]?.trigger?.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
          });

          if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
            chainLink.evolves_to.forEach((nextEvolution: any) => {
              const nextLevel =
                nextEvolution.evolution_details?.[0]?.min_level || level + 1;
              extractEvolutions(nextEvolution, nextLevel);
            });
          }
        };

        if (evolutionChain.chain) {
          extractEvolutions(evolutionChain.chain);
        }

        setEvolutionStages(stages);
      } catch (error) {
        console.error("Error fetching evolution chain:", error);
        setEvolutionError("Failed to load evolution chain");
      } finally {
        setIsLoadingEvolutions(false);
      }
    };

    fetchEvolutionChain();
  }, [species?.evolution_chain?.url]);

  const handleSwipe = ({ nativeEvent }: any) => {
    const { translationX, state } = nativeEvent;

    if (state === State.END) {
      const tabs: TabType[] = ["about", "stats", "evolutions"];
      const currentIndex = tabs.indexOf(activeTab);

      if (translationX < -50 && currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1];
        setActiveTab(nextTab);
        scrollToTab(currentIndex + 1);
      }
      else if (translationX > 50 && currentIndex > 0) {
        const prevTab = tabs[currentIndex - 1];
        setActiveTab(prevTab);
        scrollToTab(currentIndex - 1);
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else if (state === State.ACTIVE) {
      translateX.setValue(translationX);
    }
  };

  const scrollToTab = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: width * index,
        animated: true,
      });
    }
  };

  const handleTabPress = (tab: TabType) => {
    const tabs: TabType[] = ["about", "stats", "evolutions"];
    const index = tabs.indexOf(tab);
    setActiveTab(tab);
    scrollToTab(index);
  };

  const getTriggerDescription = (trigger?: string, level?: number) => {
    if (!trigger) return "";

    switch (trigger) {
      case "level-up":
        return level ? `Level ${level}` : "Level up";
      case "trade":
        return "Trade";
      case "use-item":
        return "Use item";
      default:
        return capitalize(trigger.replace("-", " "));
    }
  };

  const renderNavBar = () => (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="black" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleFavourite}
        disabled={isFavouriteLoading}
        style={styles.favouriteButton}
      >
        {isFavouriteLoading ? (
          <ActivityIndicator size="small" color="tomato" />
        ) : (
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={24}
            color={isFavourite ? "tomato" : "black"}
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
          onPress={() => handleTabPress(tab)}
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
      hp: "crimson",
      attack: "orange",
      defense: "gold",
      "special-attack": "royalblue",
      "special-defense": "limegreen",
      speed: "pink",
    };

    return (
      <View style={styles.tabContent}>
        {pokemon.stats.map((stat: PokemonStat, index: number) => {
          const statName = stat.stat.name;
          const statValue = stat.base_stat;
          const maxStat = 255;
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
    if (isLoadingEvolutions) {
      return (
        <View style={[styles.tabContent, styles.centerContainer]}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Loading evolution chain...</Text>
        </View>
      );
    }

    if (evolutionError) {
      return (
        <View style={[styles.tabContent, styles.centerContainer]}>
          <Ionicons name="warning-outline" size={48} color="tomato" />
          <Text style={styles.errorText}>{evolutionError}</Text>
        </View>
      );
    }

    if (evolutionStages.length === 0) {
      return (
        <View style={[styles.tabContent, styles.centerContainer]}>
          <Ionicons name="git-network-outline" size={48} color="silver" />
          <Text style={styles.noEvolutionsText}>No evolutions</Text>
          <Text style={styles.noEvolutionsSubtext}>
            This Pokémon doesn't evolve
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <ScrollView>
          <Text style={styles.evolutionTitle}>Evolution Chain</Text>

          <View style={styles.evolutionContainer}>
            {evolutionStages.map((stage, index) => (
              <View key={stage.id} style={styles.evolutionItem}>
                <View
                  style={[
                    styles.evolutionCard,
                    stage.id === pokemon.id && styles.currentEvolutionCard,
                  ]}
                >
                  <Image
                    source={{ uri: stage.sprite }}
                    style={styles.evolutionImage}
                    resizeMode="contain"
                  />
                  <View style={styles.evolutionInfoContainer}>
                    <View style={styles.evolutionHeader}>
                      <Text style={styles.evolutionName}>
                        {capitalize(stage.name)}
                      </Text>
                      {stage.id === pokemon.id && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.evolutionId}>
                      #{stage.id.toString().padStart(3, "0")}
                    </Text>
                    {stage.trigger && (
                      <Text style={styles.evolutionTrigger}>
                        {getTriggerDescription(stage.trigger, stage.level)}
                      </Text>
                    )}
                  </View>
                </View>

                {index < evolutionStages.length - 1 && (
                  <View style={styles.arrowContainer}>
                    <Ionicons
                      name="ellipsis-vertical-sharp"
                      size={24}
                      color="gray"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderNavBar()}
      {renderHeader()}
      {renderTabs()}

      <PanGestureHandler
        onHandlerStateChange={handleSwipe}
        onGestureEvent={handleSwipe}
      >
        <Animated.View
          style={[styles.swipeContainer, { transform: [{ translateX }] }]}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.contentContainer}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            onMomentumScrollEnd={(event) => {
              const pageIndex = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              const tabs: TabType[] = ["about", "stats", "evolutions"];
              if (pageIndex >= 0 && pageIndex < tabs.length) {
                setActiveTab(tabs[pageIndex]);
              }
            }}
          >
            <View style={{ width }}>{renderAboutTab()}</View>
            <View style={{ width }}>{renderStatsTab()}</View>
            <View style={{ width }}>{renderEvolutionsTab()}</View>
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
    color: "black",
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
    backgroundColor: "whitesmoke",
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
    color: "black",
  },
  pokemonId: {
    fontSize: 24,
    fontWeight: "600",
    color: "dimgray",
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 100,
    shadowColor: "black",
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
    borderBottomColor: "lightgray",
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
    color: "gray",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "black",
  },
  swipeContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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
    color: "dimgray",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "black",
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
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  abilitiesContainer: {
    flex: 1,
    gap: 8,
  },
  abilityBadge: {
    backgroundColor: "whitesmoke",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  abilityText: {
    color: "dimgray",
    fontSize: 14,
  },
  hiddenAbilityText: {
    color: "tomato",
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
    color: "dimgray",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
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
    backgroundColor: "whitesmoke",
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
    borderTopColor: "lightgray",
  },
  totalStatLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  totalStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  evolutionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "black",
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
    backgroundColor: "whitesmoke",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentEvolutionCard: {
    borderColor: "dodgerblue",
    backgroundColor: "aliceblue",
    borderWidth: 2,
  },
  evolutionImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  evolutionInfoContainer: {
    flex: 1,
  },
  evolutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  evolutionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  evolutionId: {
    fontSize: 14,
    color: "dimgray",
  },
  evolutionTrigger: {
    fontSize: 12,
    color: "dodgerblue",
    fontWeight: "500",
    backgroundColor: "aliceblue",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  evolutionLevel: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: "dodgerblue",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "dimgray",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "tomato",
    textAlign: "center",
  },
  noEvolutionsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "dimgray",
  },
  noEvolutionsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});

export default PokeDetails;
