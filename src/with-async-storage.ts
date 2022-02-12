import {
  flow,
  applySnapshot,
  IStateTreeNode,
  onSnapshot,
  getSnapshot,
  getType,
} from "mobx-state-tree"
import { load, save } from "./persist"

export interface WithAsyncStorageOptions {
  /**
   * The AsyncStorage key name (default: model name).
   */
  key?: string

  /**
   * Should we monitor for changes via onSnapshot (default: true)?
   */
  autoSave?: boolean

  /**
   * A list of property names. Any other property will be ignored.
   */
  only?: string | string[]

  /**
   * A list of property names that will be filtered if they exist.
   */
  except?: string | string[],

  /**
   * A function that will be called after the state was loaded
   * from AsyncStorage, in which you can modify the value that
   * will be applied to the state.
   */
  onLoad?: (loaded: {} | undefined) => Promise<{} | undefined> | {} | undefined;

  /**
   * A function that will be called after a snapshot was taken
   * but before it is passed to AsyncStorage
   */
  onSave?: (snapshot: {}) => {} | undefined;
}

/**
 * Adds AsyncStorage support to your model.
 */
export const withAsyncStorage = (options: WithAsyncStorageOptions = {}) => (
  self: IStateTreeNode,
) => {
  let disposer: Function

  // setup the default option values
  const key = options.key || getType(self).name
  const autoSave = typeof options.autoSave === "boolean" ? options.autoSave : true

  /**
   * Turns on AsyncStorage saving when the snapshot changes.
   */
  const enableSaving = () => {
    disposer && disposer()
    disposer = onSnapshot(self, snapshot => save(key, filterSnapshotKeys(snapshot)))
  }

  /**
   * Filters out what data will make it to the persistance layer.
   *
   * @param snapshot The snapshot containing our data
   */
  function filterSnapshotKeys(snapshot: any) {
    // sanity
    if (!snapshot) return snapshot

    // clean up inputs
    const filterOnly = (typeof options.only === "string"
      ? [options.only]
      : options.only || []
    ).filter(Boolean)

    const filterExcept = (typeof options.except === "string"
      ? [options.except]
      : options.except || []
    ).filter(Boolean)

    // use the input if there's no filters
    if (filterOnly.length === 0 && filterExcept.length === 0) return snapshot

    let result: any = {}

    if (filterOnly.length > 0) {
      // only add certain keys
      filterOnly.forEach(key => {
        result[key] = snapshot[key]
      })
    } else if (filterExcept.length > 0) {
      // remove certain keys
      result = { ...snapshot }
      filterExcept.forEach(key => {
        delete result[key]
      })
    }
    return result
  }

  return {
    actions: {
      /**
       * Loads from async storage.
       */
      load: flow(function*() {
        let data = yield load(key)
        if (options.onLoad) {
          data = yield Promise.resolve(options.onLoad(data))
        }
        if (data) {
          applySnapshot(self, data)
        }

        // now monitor for changes
        if (autoSave) {
          enableSaving()
        }

        // send back the data
        return data
      }) as () => Promise<any | undefined>,

      /**
       * Saves the snapshot to async storage. This only needs to be
       * called if autoSave has been turned off.
       */
      save: flow(function*() {
        let snapshot = filterSnapshotKeys(getSnapshot(self));
        if (options.onSave) {
          snapshot = yield Promise.resolve(options.onSave(snapshot))
        }
        yield save(key, snapshot)
      }),

      beforeDetach() {
        disposer && disposer()
      },
    },
  }
}
