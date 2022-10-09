import type { Content, PluginConfiguration, ImportMap } from '@micro-lc/interfaces/v2'
import type { RenderOptions } from 'lit-html'
import { html, render } from 'lit-html'

import { interpolate } from './compiler'
import { parseSources } from './importmap'
import { jsonToHtml } from './json'
import { lexer } from './lexer'
import type { ErrorCodes } from './logger'

export interface ComposerOptions {
  context?: Record<string, unknown>
  extraProperties?: string[]
}

export interface ResolvedConfig {
  content: Content
  sources: {
    importmap?: ImportMap
    uris: string[]
  }
}

export type ComposerContextAppender = (container: HTMLElement | DocumentFragment, options?: RenderOptions) => void

export type ExtendedHTMLElement<S extends Record<string, unknown>, T extends HTMLElement = HTMLElement> =
  T & S

export async function createComposerContext(
  content: Content,
  { extraProperties, context = {} }: ComposerOptions = {}
): Promise<ComposerContextAppender> {
  const htmlBuffer = jsonToHtml(content, extraProperties)
  const template = await lexer(htmlBuffer)
  const variables = interpolate(template.variables, context)
  const htmlTemplate = html(template.literals, ...variables)
  return (container, options) => render(htmlTemplate, container, options)
}

export async function premount(config: PluginConfiguration): Promise<ResolvedConfig> {
  let uris: string[] = []
  let importmap: ImportMap | undefined

  if (config.sources) {
    const { sources } = config

    importmap = (!Array.isArray(sources) && typeof sources !== 'string')
      ? sources.importmap ?? {}
      : {}

    try {
      importShim.addImportMap(importmap)
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        console.error(err)
      }
    }

    uris = parseSources(sources)

    if (uris.length > 0) {
      await Promise.all(uris.map(
        (uri) => (importShim(uri)).catch((err) => { console.error(err) })
      ))
    }
  }

  return Promise.resolve({
    content: config.content,
    sources: { importmap, uris },
  })
}

export async function fetcher(url: string): Promise<unknown> {
  const acceptedTypes = [
    'application/json',
    'text/x-json',
  ]

  return window.fetch(
    new URL(url, window.document.baseURI),
    {
      headers: {
        Accept: acceptedTypes.join(', '),
      },
    })
    .then((res) => {
      const contentType = res.headers.get('Content-Type') ?? ''
      const isJson = acceptedTypes.reduce(
        (accepted, str) => contentType.includes(str) || accepted, false
      )

      if (res.ok && isJson) {
        return res.json() as Promise<unknown>
      }

      return Promise.reject(new TypeError('20' as ErrorCodes.InvalidJSONError))
    })
}