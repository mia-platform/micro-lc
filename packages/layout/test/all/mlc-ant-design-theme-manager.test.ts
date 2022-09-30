import { expect, fixture, html } from '@open-wc/testing'
import { createSandbox } from 'sinon'

import type { MlcAntdThemeManager } from '../../src'

import '../../src/web-components/mlc-antd-theme-manager'

describe('...', () => {
  it('should send configuration to micro-lc API', async () => {
    const sandbox = createSandbox()

    const setStyleStub = sandbox.stub()

    const microlcApi: Partial<MlcAntdThemeManager['microlcApi']> = {
      getExtensions: () => ({ css: { setStyle: setStyleStub } }),
    }

    await fixture(html`
      <mlc-antd-theme-manager
        .microlcApi=${microlcApi}
        .primaryColor=${'#25B864'}
      ></mlc-antd-theme-manager>
    `)

    const expectedVars = {
      '--micro-lc-error-color': 'rgb(255, 77, 79)',
      '--micro-lc-error-color-active': '#d9363e',
      '--micro-lc-error-color-deprecated-bg': '#fff2f0',
      '--micro-lc-error-color-deprecated-border': '#ffccc7',
      '--micro-lc-error-color-disabled': '#fff1f0',
      '--micro-lc-error-color-hover': '#ff7875',
      '--micro-lc-error-color-outline': 'rgba(255, 77, 79, 0.2)',
      '--micro-lc-font-family': '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\',  Arial, \'Noto Sans\', sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\', \'Segoe UI Symbol\', \'Noto Color Emoji\'',
      '--micro-lc-info-color': 'rgb(24, 144, 255)',
      '--micro-lc-info-color-active': '#096dd9',
      '--micro-lc-info-color-deprecated-bg': '#e6f7ff',
      '--micro-lc-info-color-deprecated-border': '#91d5ff',
      '--micro-lc-info-color-disabled': '#bae7ff',
      '--micro-lc-info-color-hover': '#40a9ff',
      '--micro-lc-info-color-outline': 'rgba(24, 144, 255, 0.2)',
      '--micro-lc-primary-1': '#e9f7ec',
      '--micro-lc-primary-10': '#011f12',
      '--micro-lc-primary-2': '#c5ebd0',
      '--micro-lc-primary-3': '#97deaf',
      '--micro-lc-primary-4': '#6dd192',
      '--micro-lc-primary-5': '#47c479',
      '--micro-lc-primary-6': '#25b864',
      '--micro-lc-primary-7': '#16914f',
      '--micro-lc-primary-8': '#0b6b3b',
      '--micro-lc-primary-9': '#034526',
      '--micro-lc-primary-color': 'rgb(37, 184, 100)',
      '--micro-lc-primary-color-active': '#16914f',
      '--micro-lc-primary-color-active-deprecated-d-02': 'rgb(225, 244, 230)',
      '--micro-lc-primary-color-active-deprecated-f-30': 'rgba(233, 247, 236, 0.3)',
      '--micro-lc-primary-color-deprecated-bg': '#e9f7ec',
      '--micro-lc-primary-color-deprecated-border': '#97deaf',
      '--micro-lc-primary-color-deprecated-f-12': 'rgba(37, 184, 100, 0.12)',
      '--micro-lc-primary-color-deprecated-l-20': 'rgb(99, 224, 153)',
      '--micro-lc-primary-color-deprecated-l-35': 'rgb(163, 236, 194)',
      '--micro-lc-primary-color-deprecated-t-20': 'rgb(81, 198, 131)',
      '--micro-lc-primary-color-deprecated-t-50': 'rgb(146, 220, 178)',
      '--micro-lc-primary-color-disabled': '#c5ebd0',
      '--micro-lc-primary-color-hover': '#47c479',
      '--micro-lc-primary-color-outline': 'rgba(37, 184, 100, 0.2)',
      '--micro-lc-success-color': 'rgb(82, 196, 26)',
      '--micro-lc-success-color-active': '#389e0d',
      '--micro-lc-success-color-deprecated-bg': '#f6ffed',
      '--micro-lc-success-color-deprecated-border': '#b7eb8f',
      '--micro-lc-success-color-disabled': '#d9f7be',
      '--micro-lc-success-color-hover': '#73d13d',
      '--micro-lc-success-color-outline': 'rgba(82, 196, 26, 0.2)',
      '--micro-lc-warning-color': 'rgb(250, 173, 20)',
      '--micro-lc-warning-color-active': '#d48806',
      '--micro-lc-warning-color-deprecated-bg': '#fffbe6',
      '--micro-lc-warning-color-deprecated-border': '#ffe58f',
      '--micro-lc-warning-color-disabled': '#fff1b8',
      '--micro-lc-warning-color-hover': '#ffc53d',
      '--micro-lc-warning-color-outline': 'rgba(250, 173, 20, 0.2)',
    }

    expect(setStyleStub).to.be.calledOnce

    const [receivedArgs] = setStyleStub.args
    expect(receivedArgs).to.deep.equal([{ global: expectedVars }])

    sandbox.restore()
  })
})
