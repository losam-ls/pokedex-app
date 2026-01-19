const BASE_URL = "https://pokeapi.co/api/v2";

import type {
  EvolutionChain,
  PaginatedPokemonResponse,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
} from "../constants/pokemon";

const cache = new Map<string, { data: any; timestamp: number }>();

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const fetchAPI = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const PokeApiService = {
  listPokemons: async (
    offset: number,
    limit: number,
  ): Promise<PokemonListResponse> => {
    const cacheKey = `list-${offset}-${limit}`;
    const cached = getCachedData<PokemonListResponse>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
    const data = await fetchAPI<PokemonListResponse>(url);
    setCachedData(cacheKey, data);
    return data;
  },

  getPokemonById: async (id: number): Promise<Pokemon> => {
    const cacheKey = `pokemon-${id}`;
    const cached = getCachedData<Pokemon>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/pokemon/${id}`;
    const data = await fetchAPI<Pokemon>(url);
    setCachedData(cacheKey, data);
    return data;
  },

  getPokemonByName: async (name: string): Promise<Pokemon> => {
    const cacheKey = `pokemon-name-${name}`;
    const cached = getCachedData<Pokemon>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/pokemon/${name.toLowerCase()}`;
    const data = await fetchAPI<Pokemon>(url);
    setCachedData(cacheKey, data);
    return data;
  },

  getPokemonSpeciesById: async (id: number): Promise<PokemonSpecies> => {
    const cacheKey = `species-${id}`;
    const cached = getCachedData<PokemonSpecies>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/pokemon-species/${id}`;
    const data = await fetchAPI<PokemonSpecies>(url);
    setCachedData(cacheKey, data);
    return data;
  },

  getEvolutionChainById: async (id: number): Promise<EvolutionChain> => {
    const cacheKey = `evolution-${id}`;
    const cached = getCachedData<EvolutionChain>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/evolution-chain/${id}`;
    const data = await fetchAPI<EvolutionChain>(url);
    setCachedData(cacheKey, data);
    return data;
  },
  getPaginatedPokemon: async (
    page: number,
    limit: number = 50,
  ): Promise<PaginatedPokemonResponse> => {
    const offset = (page - 1) * limit;
    const cacheKey = `pokemon-page-${page}-${limit}`;
    const cached = getCachedData<PokemonListResponse>(cacheKey);

    let data: PokemonListResponse;
    if (cached) {
      data = cached;
    } else {
      const url = `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
      data = await fetchAPI<PokemonListResponse>(url);
      setCachedData(cacheKey, data);
    }

    const response: PaginatedPokemonResponse = {
      ...data,
      page,
      hasNextPage: data.next !== null,
    };

    return response;
  },

  clearCache: () => cache.clear(),
};
