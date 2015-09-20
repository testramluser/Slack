/// <reference path="../space-pen/space-pen.d.ts" />

declare module 'atom-space-pen-views' {
  import spacepen = require('space-pen')

  export var $: typeof spacepen.$
  export var $$: typeof spacepen.$$
  export var $$$: typeof spacepen.$$$
  export var jQuery: typeof spacepen.jQuery

  type HTMLTypes = string | HTMLElement | typeof spacepen.jQuery

  type JQueryEventCallback = (event: JQueryEventObject, ...args: any[]) => any

  export class View extends spacepen.View {
    html(str: HTMLTypes): void
    html(fn: () => HTMLTypes): any
    parents(selector: string): any
    trigger(eventName: string, ...value: any[]): void

    element: HTMLElement

    on(eventName: string, fn: JQueryEventCallback): JQuery
    on(eventName: string, selector: string, fn: JQueryEventCallback): JQuery
  }

  export class ScrollView extends View { }

  export class TextEditorView extends View {
    constructor (options: { mini?: boolean; placeholderText?: string })

    getModel(): AtomCore.IEditor
  }
}
