export class Maybe<T> {
  private constructor(private readonly _value: T | null) {}

  static of<T>(value: T | null | undefined): Maybe<T> {
    if (value === null || value === undefined) {
      return Maybe.none<T>();
    }
    return new Maybe(value);
  }

  static some<T>(value: T): Maybe<T> {
    if (value === null || value === undefined) {
      return Maybe.none<T>();
    }
    return new Maybe(value);
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    if (this._value === null) {
      return Maybe.none<U>();
    }
    return Maybe.some(fn(this._value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    if (this._value === null) {
      return Maybe.none<U>();
    }
    return fn(this._value);
  }

  getOrElse(defaultValue: T): T {
    return this._value === null ? defaultValue : this._value;
  }

  getOrDefault(defaultValue: T): T {
    return this.getOrElse(defaultValue);
  }

  getOrThrow(error: Error): T {
    if (this._value === null) {
      throw error;
    }
    return this._value;
  }

  get value(): T {
    if (this._value === null) {
      throw new Error('Cannot get value of None');
    }
    return this._value;
  }

  isNone(): boolean {
    return this._value === null;
  }

  isSome(): boolean {
    return this._value !== null;
  }
}
