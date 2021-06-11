export type Authenticated = { userId: string; readonly: boolean };
export type AuthenticateFn = (
  docId: string,
  auth: unknown,
) => Promise<Authenticated>;