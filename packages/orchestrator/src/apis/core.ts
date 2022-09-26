import type { ImportMap } from '@micro-lc/interfaces'

import type { CompleteConfig } from '../config'

import type { BaseExtension } from './extensions'
import type { Microlc } from './micro-lc'

export interface MicrolcApi<T extends BaseExtension> {
  readonly applyImportMap: (id: string, importmap: ImportMap) => void
  readonly getApplications: () => Readonly<CompleteConfig['applications']>
  readonly getCurrentConfig: () => Readonly<CompleteConfig>
  readonly getExtensions: () => Readonly<T>
  readonly router: {
    goToApplication<S = unknown>(id: string, opts?: {data?: S; type?: 'push' | 'replace'}): void
    open: (url: string | URL | undefined, target?: string | undefined, features?: string | undefined) => void
  }
  readonly setCurrentConfig: (newConfig: CompleteConfig) => void
  readonly setExtension: (key: keyof T, value: T[keyof T]) => Readonly<T>
}

export function createMicrolcApiInstance<Extensions extends BaseExtension>(
  this: Microlc<Extensions>
): () => MicrolcApi<Extensions> {
  const getApi = () => Object.freeze({
    applyImportMap: (id: string, importmap: ImportMap) => { this._applicationsImportMap.createSetMount(id, importmap) },
    getApplications: () => Object.freeze([...this._config.applications]),
    getCurrentConfig: () => Object.freeze({ ...this._config }),
    getExtensions: () => Object.freeze({ ...this._extensions }),
    router: {
      goToApplication: (_id: string, data?: unknown): void => {
        const url = this._config.applications.find(({ id }) => id === _id)?.route
        if (url) {
          window.history.pushState(data, '', url)
        }
      },
      open: (url: string | URL | undefined, target?: string | undefined, features?: string | undefined) => {
        window.open(url, target, features)
      },
    },
    setCurrentConfig: (newConfig: CompleteConfig) => { this.config = newConfig },
    setExtension: (key: keyof Extensions, value: Extensions[keyof Extensions]) => {
      this._extensions[key] = value
      return Object.freeze({ ...this._extensions })
    },
  })

  if (process.env.NODE_ENV === 'development') {
    Object.defineProperty(window, 'getMicrolcApi', { value: getApi })
  }

  return getApi
}
