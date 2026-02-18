

#### JSX Tree
Vindo’s React SSR allows developers to render nested JSX trees directly from the backend while preserving interactive components and their event handlers.

```js
export default function({db, meta, state}) {
  meta.title = 'Page title'
  meta.description = 'Short description'

  return (
    <div id="page">
      <button
        onClick={() => {
            state.set({count: state.count + 1})
        }}>
        Count: {state.count}
      </button>
    </div>
  )
}
```



#### React SSR Folder Structure
```bash
public/
src/
├── http/
│   ├── contact.ts
│   ├── [page]/
|   |   └── index.ts
│   └── about/
|       ├── careers.ts
|       └── index.ts
├── react/
|   ├── index.ts
|   └── components/
└── server.ts
```