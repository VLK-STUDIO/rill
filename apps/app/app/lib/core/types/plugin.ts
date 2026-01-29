import type { StreamCache } from "../../media";

export interface NodeRenderContext {
  streamCache: StreamCache;
  project: {
    width: number;
    height: number;
  };
}

export interface Node<
  T extends Record<string, Property> = Record<string, Property>,
> {
  label: string;
  icon: unknown;
  properties: T;
  type: "video" | "image";
  render: (
    properties: ExtractPropertyValues<T>,
    context: NodeRenderContext,
  ) => Promise<HTMLVideoElement | HTMLImageElement>;
}

export interface Plugin {
  id: string;
  panels?: Record<string, unknown>;
  nodes?: Record<string, Node>;
}

export type Property = SelectProperty | TextProperty;

export interface SelectProperty {
  type: "select";
  label: string;
  options: () => MaybePromise<{
    options: { label: string; value: string }[];
    default: string;
  }>;
}

export interface TextProperty {
  type: "text";
  label: string;
  default?: string;
  placeholder?: string;
  allowFile?: boolean;
  accept?: string;
}

export type ExtractPropertyValues<T extends Record<string, Property>> = {
  [K in keyof T]: ExtractPropertyValue<T[K]>;
};

type ExtractPropertyValue<T extends Property> = T extends { type: "select" }
  ? string
  : T extends { type: "text" }
    ? string
    : never;

type MaybePromise<T> = T | Promise<T>;
