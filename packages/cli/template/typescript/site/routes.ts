export interface ChildrenRoute {
  children: Route[]
  name: string
}

export interface RedirectRoute {
  path: string
  redirect: string
}

export interface ComponentRoute {
  component: Promise<any>
  name: string
  path: string
}

export type Route = ChildrenRoute | RedirectRoute | ComponentRoute

// tslint:disable
const routes: Route[] = [
  {
    path: '/',
    redirect: '/demo'
  },
  {
    name: '基础组件',
    children: [
      {
        name: 'Demo',
        path: '/demo',
        component: import('../src/demo/doc/index.md')
      }
    ]
  }
]

export default routes
