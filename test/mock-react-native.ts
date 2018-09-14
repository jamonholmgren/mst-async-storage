import * as td from "testdouble"

export function createMockReactNative() {
  const ReactNative = {
    AsyncStorage: {
      getItem: td.func(),
      setItem: td.func(),
    },
  }
  return ReactNative
}
