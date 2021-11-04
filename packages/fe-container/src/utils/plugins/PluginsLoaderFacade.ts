/*
 * Copyright 2021 Mia srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {createBrowserHistory} from 'history'
import {addErrorHandler, registerMicroApps, RegistrableApp, start} from 'qiankun'
import {InternalPlugin, Plugin, User} from '@mia-platform/core'

import {INTEGRATION_METHODS, MICROLC_QIANKUN_CONTAINER, RESERVED_PATH} from '@constants'
import {noOpStrategy} from '@utils/plugins/strategies/NoOpStrategy'
import {hrefStrategy} from '@utils/plugins/strategies/HrefStrategy'
import {routeStrategy} from '@utils/plugins/strategies/RouteStrategy'
import {PluginStrategy} from '@utils/plugins/strategies/PluginStrategy'
import {Shared} from '@mia-platform/core/src/models/configuration'

const registeredPluginsStrategies = new Map<string, PluginStrategy>()
export const registeredPlugins: InternalPlugin[] = []

export const registerPlugin = (plugin: Omit<Plugin, 'label'>) => {
  (plugin.content || []).forEach(registerPlugin)
  const pluginStrategy: PluginStrategy = strategyBuilder(plugin)
  registeredPlugins.push(plugin)
  registeredPluginsStrategies.set(plugin.id, pluginStrategy)
}

export const retrievePluginStrategy = (plugin: InternalPlugin) => {
  return registeredPluginsStrategies.get(plugin.id) || noOpStrategy()
}

export const isPluginLoaded = (plugin: InternalPlugin) =>
  plugin.pluginRoute ? window.location.pathname.includes(plugin.pluginRoute) : false

export const findCurrentPlugin = () => {
  return registeredPlugins.find(isPluginLoaded)
}

export const isCurrentPluginLoaded = () => {
  return isReservedPage() || findCurrentPlugin() !== undefined
}

const isReservedPage = () => {
  return RESERVED_PATH.getMicrolcPaths()
    .reduce((previousValue, currentValue) =>
      previousValue || window.location.pathname.endsWith(currentValue), false)
}

const strategyBuilder = (plugin: InternalPlugin) => {
  switch (plugin.integrationMode) {
    case INTEGRATION_METHODS.HREF:
      return hrefStrategy(plugin.externalLink)
    case INTEGRATION_METHODS.QIANKUN:
    case INTEGRATION_METHODS.IFRAME:
      return routeStrategy(plugin)
    default:
      return noOpStrategy()
  }
}

export const finish = (user: Partial<User>, shared: Shared = {}) => {
  basePath = retrieveBasePath()
  history = createBrowserHistory({basename: basePath})
  const pluginMapper = pluginToQiankunMapper(user, shared)
  const quiankunConfig = registeredPlugins
    .filter(plugin => plugin.integrationMode === INTEGRATION_METHODS.QIANKUN)
    .map<RegistrableApp<any>>(pluginMapper)
  registerMicroApps(quiankunConfig)
  addErrorHandler(_ => history.push(RESERVED_PATH.INTERNAL_ERROR))
  start()
}

const pluginToQiankunMapper = (user: Partial<User>, shared: Shared) => {
  return (plugin: InternalPlugin) => ({
    name: plugin.id,
    entry: plugin.pluginUrl || '',
    container: `#${MICROLC_QIANKUN_CONTAINER}`,
    activeRule: buildActiveRule(plugin),
    props: {
      ...shared?.props,
      ...plugin.props,
      basePath,
      activeRule: buildActiveRule(plugin),
      currentUser: user
    }
  })
}

const buildActiveRule = (plugin: InternalPlugin) => `${basePath}${plugin.pluginRoute || ''}`

const DOUBLE_SLASH = /\/\//g

const cleanReservedPath = (basePath: string) => {
  return RESERVED_PATH.getMicrolcPaths()
    .reduce((previousValue: string, currentValue: string) =>
      previousValue.replace(new RegExp(currentValue, 'g'), ''), basePath)
}

const retrieveBasePath = () => {
  const currentPlugin = findCurrentPlugin()
  let basePath = currentPlugin ? window.location.pathname.replace(currentPlugin.pluginRoute || '', '') : window.location.pathname
  basePath = cleanReservedPath(basePath).replace(DOUBLE_SLASH, '/')
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
}

export let basePath = window.location.pathname

export let history = createBrowserHistory({basename: basePath})
