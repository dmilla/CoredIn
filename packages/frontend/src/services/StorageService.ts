export type StorageType = "localStorage" | "sessionStorage";

export class StorageService {
	private readonly storage: Storage;

	constructor(private readonly storageType: StorageType = "localStorage") {
		if (storageType === "localStorage") {
			this.storage = localStorage;
		} else {
			this.storage = sessionStorage;
		}
	}

	getString(key: string): string | null {
		const item = this.storage.getItem(key);
		if (item === null) {
			return null;
		}

		return item;
	}

	getNumber(key: string): number | null {
		const item = this.getString(key);
		if (item === null) {
			return null;
		}

		const n = Number(item);
		if (isNaN(n)) {
			console.error(`Item with key ${key} is not a number (value: ${item})`);
			return null;
		}

		return n;
	}

	getObject<T>(key: string): T | null {
		const item = this.getString(key);
		if (item === null) {
			return null;
		}

		return JSON.parse(item) as T;
	}

	save(key: string, item: string | object): void {
		let itemString: string;
		if (typeof item !== "string") {
			itemString = JSON.stringify(item);
		} else {
			itemString = item;
		}

		try {
			this.storage.setItem(key, itemString);
		} catch (e) {
			console.error("The Storage is full!");
		}
	}

	remove(key: string): void {
		this.storage.removeItem(key);
	}
}
