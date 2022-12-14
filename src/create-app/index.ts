import '../css/index.less'
import { parse } from "../ast/parse";
import { Fragment, h, VNode } from "../runtime-core";
import { render } from "../runtime-dom";
import { isArray } from "../shared";
import { effect } from "../reactive";

import rootComponent from '../main'
type RootComponent = typeof rootComponent

export const $data: any = rootComponent.setup()

const app: HTMLElement = document.querySelector('#app')
effect(() => {
  createApp(rootComponent.template, app)
}, {})

function createApp(template: string, container: HTMLElement) {
  for (let key in $data) {
    if ($data[key].__v_isRef) window[<any>key] = $data[key].value
    else window[<any>key] = $data[key]
  }

  let parsedTemplate = parse(template)
  if (parsedTemplate.length > 1) {
    parsedTemplate = { tag: Fragment, children: parsedTemplate }
  } else parsedTemplate = parsedTemplate[0]

  render(doH(parsedTemplate), container)

  for (let key in $data) {
    delete window[<any>key]
  }
}


interface ParsedTemplate {
  tag: string,
  attrs?: any,
  children: Array<ParsedTemplate> | string
}
function doH(parsedTemplate: ParsedTemplate) {
  let children: unknown = parsedTemplate.children
  if (isArray(children)) {
    children = children.map(child => doH(child))
  }
  return h(parsedTemplate.tag, parsedTemplate.attrs, <Array<VNode>>children)
}