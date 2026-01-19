import { useQuery, useQueries, useInfiniteQuery } from "@tanstack/react-query";
import { PokeApiService } from "../services/poke-api";
import { PaginatedPokemonResponse } from "@/constants/pokemon";

export const usePokemonList = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ["pokemon", "list", limit, offset],
    queryFn: () => PokeApiService.listPokemons(offset, limit),
  });
};

export const usePokemonById = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ["pokemon", "by-id", id],
    queryFn: () => PokeApiService.getPokemonById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  });
};

export const usePokemonSpecies = (id: number | undefined) => {
  return useQuery({
    queryKey: ["pokemon", "species", id],
    queryFn: () => PokeApiService.getPokemonSpeciesById(id!),
    enabled: !!id,
  });
};

export const useEvolutionChain = (id: number | undefined) => {
  return useQuery({
    queryKey: ["pokemon", "evolution-chain", id],
    queryFn: () => PokeApiService.getEvolutionChainById(id!),
    enabled: !!id,
  });
};

export const usePokemonWithDetails = (id: number | string | undefined) => {
  const pokemonQuery = usePokemonById(id);
  const speciesQuery = usePokemonSpecies(pokemonQuery.data?.id);

  return {
    pokemon: pokemonQuery.data,
    species: speciesQuery.data,
    isLoading: pokemonQuery.isLoading || speciesQuery.isLoading,
    isError: pokemonQuery.isError || speciesQuery.isError,
    error: pokemonQuery.error || speciesQuery.error,
    refetch: () => {
      pokemonQuery.refetch();
      speciesQuery.refetch();
    },
  };
};

export const usePokemonByIds = (ids: number[]) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["pokemon", "by-id", id],
      queryFn: () => PokeApiService.getPokemonById(id),
    })),
    combine: (results) => ({
      data: results.map((result) => result.data).filter(Boolean),
      isLoading: results.some((result) => result.isLoading),
      isError: results.some((result) => result.isError),
    }),
  });
};


export const usePokemonInfiniteList = (limit: number = 50) => {
  return useInfiniteQuery({
    queryKey: ["pokemon", "infinite-list", limit],
    queryFn: async (context): Promise<PaginatedPokemonResponse> => {
      const page = context.pageParam as number;
      return await PokeApiService.getPaginatedPokemon(page, limit);
    },
    getNextPageParam: (lastPage: PaginatedPokemonResponse) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
};
