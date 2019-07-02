---
displayName: 'docs-demo'
imports:
    - import Demo from '..'
    - import './style.scss'
---

# Demo

:::demo 基础用法
基础用法

```jsx
export default () => {
    return (
        <div className='demo-wrapper'>
            <Demo>content</Demo>
        </div>
    )
}
```

:::

## Demo API

| 参数    | 说明        | 类型       | 可选值   | 默认值 | 是否必填|
| ------- | -------- | --------- | ------------ | ------ | --- |
| children | 内容            | React.ReactNode  | -  | true | false|
