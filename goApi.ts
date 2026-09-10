const GO_API = process.env.NEXT_PUBLIC_GO_API_URL || "http://localhost:8080";

export interface eventProps {
	eventName: string;
	date: string;
	location: string;
	startTime: string;
	endTime: string;
	volunteersNeeded: string | number;
	volunteers: string[];
	isTutoring: boolean;
	tutorHost: string;
	teachers: string;
}

export interface AccInterface {
	email: string;
	password?: string;
	firstName: string;
	lastName: string;
	grade: string | number;
	isAdmin: boolean;
	isVerified: boolean;
	volunteerHours: number;
	tutoringHours: number;
}

export interface messageInterface { name: string; text: string; }
export interface mapableHoursRequestProps {
	name: string;
	eventName: string;
	arriveTime: string;
	leaveTime: string;
	addVolunteerHours: number;
	addTutoringHours: number;
}

interface NewAccountProps {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	grade: string | number;
	isAdmin?: boolean;
	isVerified?: boolean;
	volunteerHours?: number;
	tutoringHours?: number;
}

interface RequestOptions extends RequestInit { query?: Record<string, string>; }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const url = new URL(path, GO_API);
	Object.entries(options.query || {}).forEach(([key, value]) => url.searchParams.set(key, value));
	const response = await fetch(url.toString(), options);
	if (!response.ok) throw new Error(await response.text());
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}

const json = (body: unknown): RequestInit => ({
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(body),
});

export const getEvents = () => request<eventProps[]>("/api/events");
export const addEvent = (event: eventProps) => request<eventProps>("/api/events", json({ ...event, volunteersNeeded: Number(event.volunteersNeeded) }));
export const deleteEvent = async (_eventName: string, _date: string) => { throw new Error("Event deletion is not exposed by the Go API yet."); };

export const getAccounts = () => request<AccInterface[]>("/api/members");
export const newAccount = (account: NewAccountProps) => request<AccInterface>("/api/members", json(account)).then(() => true);
export const checkAdmin = async ({ email, password }: { email: string; password: string }) => {
	try {
		await request("/api/auth/admin", json({ email, password }));
		return true;
	} catch { return false; }
};
export const checkMemberHours = async (email: string, password: string) => {
	await request("/api/auth", json({ email, password }));
	const summary = await request<{ volunteerHours: number; tutoringHours: number; name: string }>("/api/hours", { query: { email } });
	return [String(summary.volunteerHours), String(summary.tutoringHours), summary.name];
};

export const addEventVolunteers = async (eventName: string, email: string, password: string) => {
	await request("/api/auth", json({ email, password }));
	await request("/api/signups", json({ eventName, email }));
	return true;
};
export const removeEventVolunteers = async (_eventName: string, _email: string, _password: string) => { throw new Error("Leaving events is not exposed by the Go API yet."); };
export const getEventVolunteers = async (eventName: string) => (await getEvents()).find((event) => event.eventName.toLowerCase() === eventName.toLowerCase())?.volunteers || [];
export const getEventDateFromName = async (eventName: string) => (await getEvents()).find((event) => event.eventName.toLowerCase() === eventName.toLowerCase())?.date || "";
export const isPersonInVolunteers = async (_email: string, name: string, eventName: string) => (await getEventVolunteers(eventName)).includes(name);
export const getNameFromEmail = async (email: string, _querySnapshot?: unknown) => (await getAccounts()).find((account) => account.email.toLowerCase() === email.toLowerCase())?.firstName || "";
export const getIsVerfiedFromEmail = async (email: string, _querySnapshot?: unknown) => (await getAccounts()).find((account) => account.email.toLowerCase() === email.toLowerCase())?.isVerified || false;
export const didAccLogin = async (_eventName: string, email: string, password: string, _querySnapshot?: unknown) => { try { await request("/api/auth", json({ email, password })); return true; } catch { return false; } };

export const updateMember = async (_name: string, _modifiedField: object) => { throw new Error("Member updates are not exposed by the Go API yet."); };
export const deleteMember = async (_name: string) => { throw new Error("Member deletion is not exposed by the Go API yet."); };
export const makeMemberAdmin = async (_name: string) => { throw new Error("Member role changes are not exposed by the Go API yet."); };
export const makeMemberNotAdmin = async (_name: string) => { throw new Error("Member role changes are not exposed by the Go API yet."); };
export const deleteCollectionData = async (_collectionName: string) => { throw new Error("Collection deletion is not exposed by the Go API."); };
export const newMessage = async (_email: string, _password: string, _messageText: string) => { throw new Error("Messages are not exposed by the Go API yet."); };
export const getMessagesArray = async (): Promise<messageInterface[]> => [];
export const deleteMessage = async (_name: string) => { throw new Error("Messages are not exposed by the Go API yet."); };
export const newHoursRequest = async (_request: object) => { throw new Error("Hours requests are not exposed by the Go API yet."); };
export const getHoursRequestsArray = async (): Promise<mapableHoursRequestProps[]> => [];
export const approveHoursRequest = async (_name: string, _eventName: string) => { throw new Error("Hours requests are not exposed by the Go API yet."); };
export const denyHoursRequest = async (_name: string, _eventName: string) => { throw new Error("Hours requests are not exposed by the Go API yet."); };
