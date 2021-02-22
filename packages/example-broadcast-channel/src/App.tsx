import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { enableMapSet, produce } from 'immer';

import styles from './App.module.css';

import { useDemoAppCursors, useDemoAppState } from './AppState';
import { FocusInput } from './components/FocusInput';
import { FocusTextarea } from './components/FocusTextarea';
import { currentTabId } from './lib/currentTabId';

enableMapSet();

export function App() {
  const [state, updateState] = useDemoAppState();
  const [cursors, updateCursor] = useDemoAppCursors();
  const users = useMemo(
    () =>
      Array.from(cursors)
        .sort((a, b) => {
          if (a.cursorId < b.cursorId) {
            return -1;
          }
          if (a.cursorId > b.cursorId) {
            return 1;
          }
          return 0;
        })
        .map(({ cursorId }) => (
          <span
            key={cursorId}
            className={classNames(styles.userPill, {
              [styles.currentUser]: cursorId === currentTabId,
            })}
          >
            {currentTabId === cursorId ? '👑' : '🤖'}
            {cursorId}
          </span>
        )),
    [cursors],
  );

  const onChangeTitle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      updateState?.(
        produce(state, (draft) => {
          draft.title = event.target.value;
        }),
        'edit title',
      ),
    [state, updateState],
  );

  const onChangeText = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      updateState?.(
        produce(state, (draft) => {
          draft.text = event.target.value;
        }),
        'edit text',
      ),
    [state, updateState],
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.appName}>Trimerge Sync Broadcast Demo</div>
      </div>
      <div className={styles.main}>
        <div className={styles.userList}>Online: {users}</div>
        <div>
          Title:{' '}
          <FocusInput
            id="title"
            value={state.title}
            onChange={onChangeTitle}
            cursors={cursors}
            updateCursor={updateCursor}
          />
        </div>
        <FocusTextarea
          id="text"
          value={state.text}
          onChange={onChangeText}
          rows={10}
          cursors={cursors}
          updateCursor={updateCursor}
        />
        Raw State: <pre>{JSON.stringify(state, undefined, 2)}</pre>
      </div>
    </div>
  );
}
