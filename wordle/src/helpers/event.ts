type CallbackType = (params: any) => void;

type ListenerObjectType = {
  event: string;
  callback: CallbackType;
  id: string;
  once: boolean;
};

class WordleEvent {
  private listeners: ListenerObjectType[] = [];

  private removeListenerById = (id: string) => {
    const index = this.listeners.findIndex((o) => o.id === id);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  };

  private _on = (event: string, callback: CallbackType, once: boolean) => {
    const object: ListenerObjectType = {
      event,
      callback,
      id: Math.random().toString(),
      once,
    };
    this.listeners.push(object);

    return () => this.removeListenerById(object.id);
  };

  emit = (event: string, data?: any) => {
    this.listeners
      .filter((l) => l.event === event)
      .forEach((listener) => {
        listener.callback(data);
      });
  };

  on = (event: string, callback: CallbackType) =>
    this._on(event, callback, false);

  once = (event: string, callback: CallbackType) =>
    this._on(event, callback, true);
}

export const wordleEvent = new WordleEvent();
