declare module '@apps-in-toss/web-framework' {
  export function appLogin(): Promise<{ authorizationCode: string; referrer: string } | null>
  export function closeView(): Promise<void>
  export const TossAds: {
    initialize: { (options: any): void; isSupported?: () => boolean }
    attachBanner: (adGroupId: string, target: HTMLElement, options?: any) => { destroy: () => void } | undefined
    destroyAll: () => void
  }
}

declare module '@apps-in-toss/web-framework/config' {
  export function defineConfig(config: any): any
}
