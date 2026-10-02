/* File: #src/features/inventory/constants/inventoryConstants.js */

export const INVENTORY_STATUS = Object.freeze({
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DISCONTINUED: 'discontinued',
});

export const STOCK_MOVEMENT_TYPE = Object.freeze({
	IN: 'in',
	OUT: 'out',
	ADJUSTMENT: 'adjustment',
});

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
