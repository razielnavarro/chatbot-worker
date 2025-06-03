export type Env = {
	Bindings: CloudflareBindings;
	Variables: Variables;
};

export type Variables = {
	customerId?: string;
};

export type eventsData = Record<string, unknown>;
