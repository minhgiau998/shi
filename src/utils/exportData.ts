import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { InventoryItem } from '@appTypes/inventory';
import { Alert, Platform } from 'react-native';

/**
 * Export inventory items as CSV format
 */
export async function exportAsCSV(items: InventoryItem[]): Promise<void> {
    if (items.length === 0) {
        Alert.alert('No Data', 'There are no items to export.');
        return;
    }

    // CSV Header
    const headers = ['ID', 'Name', 'Type', 'Expiration Date', 'Status', 'Barcode', 'Created At'];

    // CSV Rows
    const rows = items.map(item => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in name
        item.type,
        item.expirationDate,
        item.status,
        item.barcode || '',
        item.createdAt,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const fileName = `SHI_Export_${formatDate(new Date())}.csv`;

    await saveAndShareFile(csvContent, fileName, 'text/csv');
}

/**
 * Export inventory items as JSON format
 */
export async function exportAsJSON(items: InventoryItem[]): Promise<void> {
    if (items.length === 0) {
        Alert.alert('No Data', 'There are no items to export.');
        return;
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        itemCount: items.length,
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            expirationDate: item.expirationDate,
            status: item.status,
            barcode: item.barcode || null,
            imageUri: item.imageUri || null,
            createdAt: item.createdAt,
        })),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const fileName = `SHI_Export_${formatDate(new Date())}.json`;

    await saveAndShareFile(jsonContent, fileName, 'application/json');
}

/**
 * Save content to a file and share it (Cross-Platform)
 */
async function saveAndShareFile(content: string, fileName: string, mimeType: string): Promise<void> {
    // ---------------------------------------------------------
    // 1. WEB IMPLEMENTATION (Browser Download)
    // ---------------------------------------------------------
    if (Platform.OS === 'web') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            // Create invisible link to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return;
        } catch (error) {
            console.error('Web export error:', error);
            Alert.alert('Export Failed', 'Could not download file on web.');
            return;
        }
    }

    // ---------------------------------------------------------
    // 2. NATIVE IMPLEMENTATION (Android / iOS)
    // ---------------------------------------------------------
    try {
        // Cast to 'any' to bypass the TypeScript definition error
        const fs = FileSystem as any;

        // Use cacheDirectory, fallback to documentDirectory if cache is unavailable
        const dir = fs.cacheDirectory || fs.documentDirectory;

        if (!dir) {
            throw new Error('No writable directory (cache or document) is available on this device.');
        }

        const fileUri = `${dir}${fileName}`;

        // Write the file
        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: 'utf8', // Use string literal to avoid Enum error
        });

        // Check if sharing is supported
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType,
                dialogTitle: `Export ${fileName}`,
                UTI: mimeType === 'text/csv' ? 'public.comma-separated-values-text' : 'public.json',
            });
        } else {
            Alert.alert(
                'Saved',
                `Sharing is not supported on this device.\nFile saved to:\n${fileUri}`,
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        console.error('Native export error:', error);
        Alert.alert(
            'Export Failed',
            `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
            [{ text: 'OK' }]
        );
    }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}