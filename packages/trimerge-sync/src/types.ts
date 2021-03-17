export type ErrorCode =
  | 'invalid-sync-id'
  | 'invalid-nodes'
  | 'internal'
  | 'disconnected'
  | 'network';

export type DiffNode<EditMetadata, Delta> = {
  userId: string;
  cursorId: string;
  ref: string;
  baseRef?: string;
  mergeRef?: string;
  mergeBaseRef?: string;
  delta?: Delta;
  editMetadata: EditMetadata;
};

export type LocalReadStatus =
  | 'loading' /** reading state from disk */
  | 'ready'; /** have latest state from disk, receiving local changes */

export type LocalSaveStatus =
  | 'ready' /** no changes in local memory */
  | 'pending' /** changes in local memory, not sent to store yet */
  | 'saving'; /** sent changes to local store, no `ack` yet */

export type RemoteConnectStatus = 'offline' | 'connecting' | 'online';

export type RemoteReadStatus = 'offline' | 'loading' | 'ready';

export type RemoteSaveStatus =
  | 'ready' /**  all local state has been synced to remote (though maybe local changes in memory) */
  | 'pending' /**  we have local state that hasn't been sent to remote yet (maybe offline) */
  | 'saving'; /**  we sent local state to remote, but haven't got `ack` yet */

export type SyncStatus = {
  localRead: LocalReadStatus;
  localSave: LocalSaveStatus;
  remoteConnect: RemoteConnectStatus;
  remoteRead: RemoteReadStatus;
  remoteSave: RemoteSaveStatus;
};

export type CursorRef<CursorState> = {
  ref: string | undefined;
  state: CursorState | undefined;
};

export type CursorInfo<CursorState> = CursorRef<CursorState> & {
  userId: string;
  cursorId: string;
  origin: 'self' | 'local' | 'remote';
};

export type CursorInfos<CursorState> = readonly CursorInfo<CursorState>[];

export type NodesEvent<EditMetadata, Delta, CursorState> = {
  type: 'nodes';
  nodes: readonly DiffNode<EditMetadata, Delta>[];
  cursor?: CursorInfo<CursorState>;
  syncId: string;
};
export type ReadyEvent = {
  type: 'ready';
};
export type AckNodesEvent = {
  type: 'ack';
  refs: readonly string[];
  syncId: string;
};
export type CursorJoinEvent<CursorState> = {
  type: 'cursor-join';
  cursor: CursorInfo<CursorState>;
};
export type CursorUpdateEvent<CursorState> = {
  type: 'cursor-update';
  cursor: CursorInfo<CursorState>;
};
export type CursorHereEvent<CursorState> = {
  type: 'cursor-here';
  cursor: CursorInfo<CursorState>;
};
export type CursorLeaveEvent = {
  type: 'cursor-leave';
  userId: string;
  cursorId: string;
};
export type ErrorEvent = {
  type: 'error';
  code: ErrorCode;
  message?: string;
  fatal?: boolean;
  reconnect?: boolean;
};
export type RemoteStateEvent = {
  type: 'remote-state';
  connect?: RemoteConnectStatus;
  read?: RemoteReadStatus;
  save?: RemoteSaveStatus;
};

// FIXME: split into local and remote events?
export type BackendEvent<EditMetadata, Delta, CursorState> = Readonly<
  | NodesEvent<EditMetadata, Delta, CursorState>
  | ReadyEvent
  | AckNodesEvent
  | CursorJoinEvent<CursorState>
  | CursorHereEvent<CursorState>
  | CursorUpdateEvent<CursorState>
  | CursorLeaveEvent
  | RemoteStateEvent
  | ErrorEvent
>;

export type OnEventFn<EditMetadata, Delta, CursorState> = (
  event: BackendEvent<EditMetadata, Delta, CursorState>,
) => void;

export type GetLocalBackendFn<EditMetadata, Delta, CursorState> = (
  userId: string,
  cursorId: string,
  onEvent: OnEventFn<EditMetadata, Delta, CursorState>,
) => LocalBackend<EditMetadata, Delta, CursorState>;

export type GetRemoteBackendFn<EditMetadata, Delta, CursorState> = (
  userId: string,
  lastSyncId: string | undefined,
  onEvent: OnEventFn<EditMetadata, Delta, CursorState>,
) => RemoteBackend<EditMetadata, Delta, CursorState>;

export interface LocalBackend<EditMetadata, Delta, CursorState> {
  update(
    nodes: DiffNode<EditMetadata, Delta>[],
    cursor: CursorRef<CursorState> | undefined,
  ): void;
  shutdown(): void | Promise<void>;
}

export interface RemoteBackend<EditMetadata, Delta, CursorState> {
  send(event: BackendEvent<EditMetadata, Delta, CursorState>): void;
  shutdown(): void | Promise<void>;
}

export type UnsubscribeFn = () => void;
