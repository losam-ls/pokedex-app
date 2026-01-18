import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pokemon } from "@/constants/pokemon";
import { databaseService, type FavouritePokemon } from "../services/db";
import { PokeApiService } from "../services/poke-api";

export const useFavourites = () => {
  return useQuery({
    queryKey: ["pokemon", "favourites"],
    queryFn: () => databaseService.getAllFavourites(),
  });
};

export const useFavouriteStatus = (pokemonId: number) => {
  return useQuery({
    queryKey: ["pokemon", "favourite-status", pokemonId],
    queryFn: () => databaseService.isFavourite(pokemonId),
    enabled: !!pokemonId,
  });
};

export const useToggleFavourite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pokemonId,
      name,
      imageUrl,
      isCurrentlyFavourite,
    }: {
      pokemonId: number;
      name: string;
      imageUrl?: string;
      isCurrentlyFavourite: boolean;
    }) => {
      if (isCurrentlyFavourite) {
        await databaseService.removeFavourite(pokemonId);
      } else {
        await databaseService.addFavourite(pokemonId, name, imageUrl);
      }
      return !isCurrentlyFavourite;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["pokemon", "favourite-status", variables.pokemonId],
      });
      await queryClient.cancelQueries({
        queryKey: ["pokemon", "favourites"],
      });

      const previousFavouriteStatus = queryClient.getQueryData([
        "pokemon",
        "favourite-status",
        variables.pokemonId,
      ]);

      const previousFavourites = queryClient.getQueryData([
        "pokemon",
        "favourites",
      ]);

      queryClient.setQueryData(
        ["pokemon", "favourite-status", variables.pokemonId],
        !variables.isCurrentlyFavourite,
      );

      if (variables.isCurrentlyFavourite) {
        queryClient.setQueryData(
          ["pokemon", "favourites"],
          (old: FavouritePokemon[]) =>
            old?.filter((fav) => fav.id !== variables.pokemonId) || [],
        );
      } else {
        const newFavourite: FavouritePokemon = {
          id: variables.pokemonId,
          name: variables.name,
          image_url: variables.imageUrl || "",
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData(
          ["pokemon", "favourites"],
          (old: FavouritePokemon[]) => [newFavourite, ...(old || [])],
        );
      }

      return { previousFavouriteStatus, previousFavourites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavouriteStatus) {
        queryClient.setQueryData(
          ["pokemon", "favourite-status", variables.pokemonId],
          context.previousFavouriteStatus,
        );
      }
      if (context?.previousFavourites) {
        queryClient.setQueryData(
          ["pokemon", "favourites"],
          context.previousFavourites,
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pokemon", "favourites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pokemon", "favourite-status", variables.pokemonId],
      });
    },
  });
};

export const useFavouritesWithDetails = () => {
  const { data: favourites, isLoading, error } = useFavourites();

  const pokemonIds = favourites?.map((fav) => fav.id) || [];

  return useQuery({
    queryKey: ["pokemon", "favourites", "details", pokemonIds],
    queryFn: async () => {
      const promises = pokemonIds.map((id) =>
        PokeApiService.getPokemonById(id).catch((error) => {
          console.error(`Error fetching Pokémon ${id}:`, error);
          return null;
        }),
      );
      const results = await Promise.all(promises);
      return results.filter((result): result is Pokemon => result !== null);
    },
    enabled: pokemonIds.length > 0 && !!favourites,
    select: (pokemonList) => {
      return pokemonList.sort((a, b) => {
        const favA = favourites?.find((fav) => fav.id === a.id);
        const favB = favourites?.find((fav) => fav.id === b.id);
        return (
          new Date(favB?.created_at || 0).getTime() -
          new Date(favA?.created_at || 0).getTime()
        );
      });
    },
  });
};

export const useBulkFavouriteStatus = (pokemonIds: number[]) => {
  return useQuery({
    queryKey: ["pokemon", "bulk-favourite-status", pokemonIds],
    queryFn: async () => {
      const statuses = await Promise.all(
        pokemonIds.map((id) => databaseService.isFavourite(id)),
      );
      return pokemonIds.reduce(
        (acc, id, index) => {
          acc[id] = statuses[index];
          return acc;
        },
        {} as Record<number, boolean>,
      );
    },
    enabled: pokemonIds.length > 0,
  });
};

export const useAddMultipleFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      pokemonList: Array<{
        id: number;
        name: string;
        imageUrl?: string;
      }>,
    ) => {
      for (const pokemon of pokemonList) {
        await databaseService.addFavourite(
          pokemon.id,
          pokemon.name,
          pokemon.imageUrl,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pokemon", "favourites"],
      });
    },
  });
};

export const useRemoveMultipleFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pokemonIds: number[]) => {
      for (const id of pokemonIds) {
        await databaseService.removeFavourite(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pokemon", "favourites"],
      });
    },
  });
};

export const useClearFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const favourites = await databaseService.getAllFavourites();
      for (const favourite of favourites) {
        await databaseService.removeFavourite(favourite.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pokemon", "favourites"],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "pokemon" &&
          query.queryKey[1] === "favourite-status",
      });
    },
  });
};

export const useFavouriteCount = () => {
  const { data: favourites } = useFavourites();

  return {
    count: favourites?.length || 0,
    isLoading: !favourites,
  };
};

export const useSearchFavourites = (searchTerm: string) => {
  const {
    data: favouritesWithDetails,
    isLoading,
    error,
  } = useFavouritesWithDetails();

  return {
    data: favouritesWithDetails?.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.id.toString().includes(searchTerm),
    ),
    isLoading,
    error,
  };
};

export const useRecentFavourites = (limit: number = 5) => {
  const { data: favourites } = useFavourites();

  return {
    data: favourites
      ?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit),
    isLoading: !favourites,
  };
};
