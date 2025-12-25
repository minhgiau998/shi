import recipes from '@assets/recipes.json';
import { InventoryItem } from '@appTypes/inventory';

export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    tag: string;
}

export interface RecipeSuggestion {
    key: string;
    params?: {
        recipe?: string;
        item?: string;
    };
    recipe?: Recipe;
}

export function getRecipeSuggestion(expiringItems: InventoryItem[]): RecipeSuggestion | null {
    const foodItems = expiringItems.filter(item => item.type === 'Food' && item.status === 'Expiring Soon');

    if (foodItems.length === 0) return null;

    for (const item of foodItems) {
        // 1. Keyword Match
        const match = (recipes as Recipe[]).find(recipe =>
            recipe.ingredients.some(ing => item.name.toLowerCase().includes(ing.toLowerCase()))
        );

        if (match) {
            return {
                key: 'recipes.suggestion',
                params: {
                    recipe: match.name, // Key into recipes.names
                    item: item.name
                },
                recipe: match,
            };
        }
    }

    // 2. Fallback
    return {
        key: 'recipes.fallback',
    };
}
