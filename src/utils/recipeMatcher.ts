import recipes from '@assets/recipes.json';
import { InventoryItem } from '@appTypes/inventory';

export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    tag: string;
}

export function getRecipeSuggestion(expiringItems: InventoryItem[]): { message: string; recipe?: Recipe } | null {
    const foodItems = expiringItems.filter(item => item.type === 'Food' && item.status === 'Expiring Soon');

    if (foodItems.length === 0) return null;

    for (const item of foodItems) {
        // 1. Keyword Match
        const match = (recipes as Recipe[]).find(recipe =>
            recipe.ingredients.some(ing => item.name.toLowerCase().includes(ing.toLowerCase()))
        );

        if (match) {
            return {
                message: `Try making ${match.name} with your ${item.name}!`,
                recipe: match,
            };
        }
    }

    // 2. Fallback
    return {
        message: "How about a quick healthy meal with your items?",
    };
}
