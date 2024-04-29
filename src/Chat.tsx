/* global NAF */
import { Component, For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Portal } from 'solid-js/web';
// @ts-ignore
import Linkify from 'solid-media-linkify';
import { BsChatDots, BsSend } from 'solid-icons/bs';
import { VsChromeClose } from 'solid-icons/vs';
import { username } from './UsernameInput';
import { setShowUsersPanel } from './UsersButton';

const [isDocumentVisible, setIsDocumentVisible] = createSignal(true);

interface ChatMessage {
  type: 'chat';
  text: string;
  name: string;
  fromClientId: string;
}

export type NetworkedMessage = ChatMessage;

export type LogEntry = NetworkedMessage & {
  key?: string;
  viewed?: boolean;
};

interface MessagesStore {
  entries: LogEntry[];
  firstUnreadKey: string | null;
}

const [pendingMessage, setPendingMessage] = createSignal('');
export const [messages, setMessages] = createStore<MessagesStore>({
  entries: [],
  firstUnreadKey: null,
});

const addToChat = (entry: LogEntry) => {
  entry.key = Date.now().toString();
  entry.viewed = isDocumentVisible() && showChatPanel();
  if (!messages.firstUnreadKey && !entry.viewed) {
    setMessages('firstUnreadKey', entry.key);
  }
  setMessages('entries', (entries) => [...entries, entry]);
};

const sendMessage = (text: string, name: string) => {
  const entry: ChatMessage = { type: 'chat', text: text, name: name, fromClientId: NAF.clientId };
  addToChat(entry);
  NAF.connection.broadcastDataGuaranteed('chat', entry);
};

NAF.connection.subscribeToDataChannel('chat', (senderId, dataType, data, targetId) => {
  // append the data.text to the message log and data.name as username
  addToChat(data as LogEntry);
});

interface ChatMessageProps {
  entry: LogEntry;
  scroll?: () => void;
}

export const [showChatPanel, setShowChatPanel] = createSignal(false);

export const ChatButton = () => {
  onMount(() => {
    const listener = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    listener();
    document.addEventListener('visibilitychange', listener);
    onCleanup(() => {
      document.removeEventListener('visibilitychange', listener);
    });
  });

  const unreadCount = createMemo(() => {
    return messages.entries.reduce((acc, entry) => acc + (entry.viewed ? 0 : 1), 0);
  });

  return (
    <>
      <button
        type="button"
        class="btn-secondary btn-rounded relative"
        classList={{ active: showChatPanel() }}
        onClick={() => {
          setShowChatPanel((v) => !v);
          if (showChatPanel()) {
            setShowUsersPanel(false);
          }
        }}
        title="Chat"
      >
        <BsChatDots size={24} />
        <Show when={unreadCount() !== 0}>
          <span class="animation-ping counter-red"></span>
          <span class="counter-red">
            <span>{unreadCount()}</span>
          </span>
        </Show>
      </button>

      <Portal>
        <Show when={showChatPanel()}>
          <ChatPanel />
        </Show>
      </Portal>
    </>
  );
};

export const ChatMessageRepresentation: Component<ChatMessageProps> = (props) => {
  return (
    <div
      class="pointer-events-auto mb-2 mr-2 flex flex-col"
      classList={{
        'items-end': props.entry.fromClientId === NAF.clientId,
        'items-start': props.entry.fromClientId !== NAF.clientId,
      }}
    >
      <Show when={props.entry.fromClientId !== NAF.clientId}>
        <span class="text-sm font-normal">{props.entry.name}</span>
      </Show>
      <div
        class="whitespace-pre-wrap rounded-xl p-2 text-base font-normal text-gray-900"
        classList={{
          'bg-sky-200': props.entry.fromClientId === NAF.clientId,
          'bg-gray-200': props.entry.fromClientId !== NAF.clientId,
        }}
      >
        <Linkify text={props.entry.text} guessType={false} emoji={true} trim={false} scroll={props.scroll} />
      </div>
    </div>
  );
};

interface ChatPanelProps {}

export const ChatPanel: Component<ChatPanelProps> = (props) => {
  const sendMessageAndResetInput = (e: Event) => {
    e.preventDefault();
    if (input.value.length > 0) {
      sendMessage(input.value, username());
      setPendingMessage('');
    }
  };

  const [textRow, setTextRow] = createSignal(1);

  createEffect(() => {
    let rows = pendingMessage().split('\n').length;
    if (rows === 1 && pendingMessage().length > 35) rows = 2;
    if (rows === 0) {
      setTextRow(1);
    } else if (rows > 6) {
      setTextRow(6);
    } else {
      setTextRow(rows);
    }
    if (input) {
      input.scrollTop = input.scrollHeight; // focus on bottom
    }
  });

  createEffect(() => {
    if (pendingMessage().length === 0 && messages.entries.length > 0) {
      // if we have new message and we are not currently typing a new message, scroll to bottom
      scrollToBottom();
    }
  });

  createEffect(() => {
    if (showChatPanel()) {
      setTimeout(() => {
        messagesEndRef?.scrollIntoView();
      }, 100); // the ref is undefined if we execute right away
      setTimeout(() => {
        setMessages(
          'entries',
          (entry) => !entry.viewed,
          'viewed',
          (v) => !v,
        );
        setMessages('firstUnreadKey', null);
      }, 3000);
    }
  });

  let input!: HTMLTextAreaElement;
  let messagesEndRef!: HTMLDivElement;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <Show when={showChatPanel()}>
      <div class="bg-panel absolute bottom-16 left-2 right-2 top-16 z-10 flex max-w-full flex-col justify-between rounded-lg p-4 shadow-lg ring-1 ring-black ring-opacity-5 sm:left-auto sm:w-screen sm:max-w-sm">
        <div class="flex justify-end space-x-2 pb-2">
          <button class="btn-secondary btn-rounded" type="button" title="Close" onClick={() => setShowChatPanel(false)}>
            <VsChromeClose size={16} />
          </button>
        </div>
        <div class="flex grow flex-col overflow-y-auto">
          <For each={messages.entries}>
            {(entry) => {
              return (
                <>
                  <Show when={messages.firstUnreadKey === entry.key}>
                    <div class="relative w-full">
                      <div class="absolute w-full text-center text-sm font-bold text-red-600">unread from here</div>
                    </div>
                  </Show>
                  <ChatMessageRepresentation entry={entry} scroll={scrollToBottom} />
                </>
              );
            }}
          </For>
          <div ref={messagesEndRef}></div>
        </div>
        <form class="relative flex" onSubmit={sendMessageAndResetInput}>
          <textarea
            rows={textRow()}
            class="form-textarea flex grow resize-none rounded-lg pr-10"
            ref={input}
            value={pendingMessage()}
            placeholder={'Text message'}
            onInput={(e) => {
              setPendingMessage(input.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                sendMessageAndResetInput(e);
              }
            }}
          />
          <div class="absolute right-0 flex h-full items-center justify-center">
            <button
              type="submit"
              class="btn-in-input pr-4"
              title="Send message"
              disabled={pendingMessage().length === 0}
            >
              <BsSend size={24} />
            </button>
          </div>
        </form>
      </div>
    </Show>
  );
};
