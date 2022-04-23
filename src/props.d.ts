import { Language } from "models.d";

export interface ISnippetProps {
  _id: number;
  properties: {
    title: string;
  };
}

export interface IFragmentProps {
  _id: number;
  properties: {
    title?: string;
    content?: string;
    language?: Partial<Language>;
  };
}
