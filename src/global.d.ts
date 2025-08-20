interface NetlifyUser {
	id: string;
	email: string;
	user_metadata?: Record<string, unknown>;
	// añade otras propiedades que uses si quieres
}

interface NetlifyIdentity {
	on(event: 'login' | 'logout' | 'init', callback: (user?: NetlifyUser) => void): void;
	off(event: 'login' | 'logout' | 'init', callback: (user?: NetlifyUser) => void): void;
	currentUser(): NetlifyUser | null;
	open(): void;
	logout(): Promise<void>;
}

interface Window {
	netlifyIdentity: NetlifyIdentity;
}
