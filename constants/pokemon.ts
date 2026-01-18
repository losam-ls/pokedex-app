export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonCries {
  latest: string;
  legacy: string;
}

export interface VersionGameIndex {
  game_index: number;
  version: NamedAPIResource;
}

export interface PokemonHeldItemVersion {
  version: NamedAPIResource;
  rarity: number;
}

export interface PokemonHeldItem {
  item: NamedAPIResource;
  version_details: PokemonHeldItemVersion[];
}

export interface PokemonMoveVersion {
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
  level_learned_at: number;
  order?: number | null;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PastAbility {
  abilities: {
    ability: NamedAPIResource | null;
    is_hidden: boolean;
    slot: number;
  }[];
  generation: NamedAPIResource;
}

export interface PokemonSprites {
  back_default: string | null;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
  other: {
    dream_world: {
      front_default: string | null;
      front_female: string | null;
    };
    home: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    "official-artwork": {
      front_default: string | null;
      front_shiny: string | null;
    };
    showdown: {
      back_default: string | null;
      back_female: string | null;
      back_shiny: string | null;
      back_shiny_female: string | null;
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
  };
  versions: Record<string, Record<string, any>>;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}


export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  order: number;
  is_default: boolean;
  abilities: PokemonAbility[];
  cries: PokemonCries;
  forms: NamedAPIResource[];
  game_indices: VersionGameIndex[];
  held_items: PokemonHeldItem[];
  location_area_encounters: string;
  moves: PokemonMove[];
  past_abilities: PastAbility[];
  past_types: any[];
  species: NamedAPIResource;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: Array<{
    entry_number: number;
    pokedex: NamedAPIResource;
  }>;
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: {
    url: string;
  };
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  names: Array<{
    name: string;
    language: NamedAPIResource;
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }>;
  form_descriptions: Array<{
    description: string;
    language: NamedAPIResource;
  }>;
  genera: Array<{
    genus: string;
    language: NamedAPIResource;
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: NamedAPIResource;
  }>;
}

export interface EvolutionChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: Array<{
    item: NamedAPIResource | null;
    trigger: NamedAPIResource;
    gender: number | null;
    held_item: NamedAPIResource | null;
    known_move: NamedAPIResource | null;
    known_move_type: NamedAPIResource | null;
    location: NamedAPIResource | null;
    min_level: number | null;
    min_happiness: number | null;
    min_beauty: number | null;
    min_affection: number | null;
    needs_overworld_rain: boolean;
    party_species: NamedAPIResource | null;
    party_type: NamedAPIResource | null;
    relative_physical_stats: number | null;
    time_of_day: string;
    trade_species: NamedAPIResource | null;
    turn_upside_down: boolean;
  }> | null;
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChain {
  id: number;
  baby_trigger_item: NamedAPIResource | null;
  chain: EvolutionChainLink;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface SimplifiedPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: PokemonType[];
}
