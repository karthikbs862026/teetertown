export interface AnalyticsAdapter {
  emit(event: string, fields: Readonly<Record<string, string | number | boolean | null>>): void;
}

export interface HapticsAdapter {
  pulse(kind: "selection" | "warning" | "success"): Promise<boolean>;
}

export interface ShareAdapter {
  shareText(text: string): Promise<boolean>;
}

export interface CommerceAdapter {
  readonly available: false;
}

export interface PlatformServices {
  readonly analytics: AnalyticsAdapter;
  readonly haptics: HapticsAdapter;
  readonly share: ShareAdapter;
  readonly commerce: CommerceAdapter;
}

class NoopAnalytics implements AnalyticsAdapter {
  public emit(
    event: string,
    fields: Readonly<Record<string, string | number | boolean | null>>
  ): void {
    void event;
    void fields;
  }
}

class NoopHaptics implements HapticsAdapter {
  public async pulse(kind: "selection" | "warning" | "success"): Promise<boolean> {
    void kind;
    return Promise.resolve(false);
  }
}

class NoopShare implements ShareAdapter {
  public async shareText(text: string): Promise<boolean> {
    void text;
    return Promise.resolve(false);
  }
}

export function createPhaseOnePlatformServices(): PlatformServices {
  return {
    analytics: new NoopAnalytics(),
    haptics: new NoopHaptics(),
    share: new NoopShare(),
    commerce: { available: false }
  };
}
