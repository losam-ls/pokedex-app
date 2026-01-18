import * as SQLite from "expo-sqlite";

export interface FavouritePokemon {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}


class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("pokedex.db");
      await this.createTables();
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS favourites (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async addFavourite(
    pokemonId: number,
    name: string,
    imageUrl?: string,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        "INSERT OR REPLACE INTO favourites (id, name, image_url) VALUES (?, ?, ?)",
        [pokemonId, name, imageUrl || ""],
      );
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  async getAllFavourites(): Promise<FavouritePokemon[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getAllAsync<FavouritePokemon>(
        "SELECT * FROM favourites ORDER BY created_at DESC",
      );
      return result;
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  async isFavourite(pokemonId: number): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM favourites WHERE id = ?",
        [pokemonId],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  async removeFavourite(pokemonId: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync("DELETE FROM favourites WHERE id = ?", [pokemonId]);
    } catch (error) {
      console.error("Error removing favourite:", error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
