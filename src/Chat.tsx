/* global NAF */
import { Component, For, Show, createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
// @ts-ignore
import Linkify from 'solid-media-linkify';
import { BsChatDots, BsSend } from 'solid-icons/bs';
import { username } from './UsernameInput';

interface ChatMessageEntry {
  text: string;
  name: string;
  fromClientId: string;
}

const [pendingMessage, setPendingMessage] = createSignal('');
export const [messages, setMessages] = createStore<{ entries: ChatMessageEntry[] }>({ entries: [] });

const sendMessage = (text: string, name: string) => {
  const entry = { text: text, name: name };
  setMessages('entries', (entries) => [...entries, { ...entry, fromClientId: NAF.clientId }]);
  NAF.connection.broadcastDataGuaranteed('chat', entry);
};

NAF.connection.subscribeToDataChannel('chat', (senderId, dataType, data, targetId) => {
  // append the data.text to the message log and data.name as username
  setMessages('entries', (entries) => [...entries, { ...data, fromClientId: senderId } as ChatMessageEntry]);
});

interface ChatMessageProps {
  entry: ChatMessageEntry;
  scroll?: () => void;
}

export const [showChatPanel, setShowChatPanel] = createSignal(false);

export const ChatButton = () => {
  return (
    <button
      type="button"
      class="btn-secondary btn-rounded"
      classList={{ active: showChatPanel() }}
      onClick={() => {
        setShowChatPanel((v) => !v);
      }}
      title="Chat"
    >
      <BsChatDots size={24} />
    </button>
  );
};

export const ChatMessage: Component<ChatMessageProps> = (props) => {
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

  let input!: HTMLTextAreaElement;
  let messagesEndRef!: HTMLDivElement;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <Show when={showChatPanel()}>
      <div class="bg-panel absolute bottom-16 left-2 right-2 top-16 z-10 flex max-w-full flex-col justify-between rounded-lg p-4 shadow-lg ring-1 ring-black ring-opacity-5 sm:left-auto sm:w-screen sm:max-w-sm">
        <div class="flex grow flex-col overflow-y-auto">
          <For each={messages.entries}>
            {(entry) => {
              return (
                <>
                  <ChatMessage entry={entry} scroll={scrollToBottom} />
                </>
              );
            }}
          </For>
          <div ref={messagesEndRef}></div>
        </div>
        <form class="relative flex" onSubmit={sendMessageAndResetInput}>
          <textarea
            rows={textRow()}
            class="flex grow resize-none rounded-lg pr-10"
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
