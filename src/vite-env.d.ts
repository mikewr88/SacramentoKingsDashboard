/// <reference types="vite/client" />

declare module '*.csv?url' {
  const url: string
  export default url
}

declare module '*.JPG' {
  const url: string
  export default url
}
