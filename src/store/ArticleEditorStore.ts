import { create } from "zustand";
import { useShallow } from "zustand/shallow";


interface ArticleEditorStoreType {
  title: string;
  editorValue: string;
  landingImage: string;
  organisation: string;
  keywords: string[];
  tags: string[];
  attachments: string[];

  articleIsHidden: boolean;
  articleIsShownOnMainSite: boolean;

  setTitle: (title: string) => void;
  setEditorValue: (editorValue: string) => void;
  setLandingImage: (landingImage: string) => void;
  setOrganisation: (organisation: string) => void;
  setKeywords: (updater: string[] | ((prev: string[]) => string[])) => void;
  setTags: (updater: string[] | ((prev: string[]) => string[])) => void;
  setAttachments: (updater: string[] | ((prev: string[]) => string[])) => void;

  setArticleIsHidden: (value: boolean) => void;
  setArticleShownOnMainSite: (value: boolean) => void;

  toggleArticleIsHidden: () => void;
  toggleArticleIsShownOnMainSite: () => void;
};

export const useArticleEditorStore = create<ArticleEditorStoreType>((set, get) => ({
  title: "",
  editorValue: "",
  landingImage: "",
  organisation: "",
  keywords: [],
  tags: [],
  attachments: [],

  articleIsHidden: false,
  articleIsShownOnMainSite: true,

  setTitle: (title) => set({ title }),
  setEditorValue: (editorValue) => set({ editorValue }),
  setLandingImage: (landingImage) => set({ landingImage }),
  setOrganisation: (organisation) => set({ organisation }),
  setKeywords: (updater) =>
    set((state) => ({
      keywords: typeof updater === "function" ? updater(state.keywords) : updater,
    })),
  setTags: (updater) =>
    set((state) => ({
      tags: typeof updater === "function" ? updater(state.tags) : updater,
    })),
  setAttachments: (updater) =>
    set((state) => ({
      attachments: typeof updater === "function" ? updater(state.attachments) : updater,
    })),

  setArticleIsHidden: (value) => set({ articleIsHidden: value }),
  setArticleShownOnMainSite: (value) => set({ articleIsShownOnMainSite: value }),

  toggleArticleIsHidden: () => set((state) => ({ 
    articleIsHidden: !state.articleIsHidden 
  })),
  toggleArticleIsShownOnMainSite: () => set((state) => ({ 
    articleIsShownOnMainSite: !state.articleIsShownOnMainSite 
  })),
}));


export const useTitle = () =>
  useArticleEditorStore(
    useShallow(state => ({
      title: state.title,
      setTitle: state.setTitle,
    }))
  );

export const useEditorValue = () =>
  useArticleEditorStore(
    useShallow(state => ({
      editorValue: state.editorValue,
      setEditorValue: state.setEditorValue,
    }))
  );

export const useLandingImage = () =>
  useArticleEditorStore(
    useShallow(state => ({
      landingImage: state.landingImage,
      setLandingImage: state.setLandingImage,
    }))
  );

export const useOrganisation = () => 
  useArticleEditorStore(
    useShallow(state => ({
      organisation: state.organisation,
      setOrganisation: state.setOrganisation
    }))
  )

export const useKeywords = () =>
  useArticleEditorStore(
    useShallow(state => ({
      keywords: state.keywords,
      setKeywords: state.setKeywords,
    }))
  );

export const useTags = () =>
  useArticleEditorStore(
    useShallow(state => ({
      tags: state.tags,
      setTags: state.setTags,
    }))
  );

export const useAttachments = () =>
  useArticleEditorStore(
    useShallow(state => ({
      attachments: state.attachments,
      setAttachments: state.setAttachments,
    }))
  );

export const useArticleIsHidden = () =>
  useArticleEditorStore(
    useShallow(state => ({
      articleIsHidden: state.articleIsHidden,
      setArticleIsHidden: state.setArticleIsHidden,
    }))
  );

export const useArticleIsShownOnMainSite = () =>
  useArticleEditorStore(
    useShallow(state => ({
      articleIsShownOnMainSite: state.articleIsShownOnMainSite,
      setArticleShownOnMainSite: state.setArticleShownOnMainSite,
    }))
  );

export const useToggleArticleIsHidden = () =>
  useArticleEditorStore(state => state.toggleArticleIsHidden);

export const useToggleArticleIsShownOnMainSite = () =>
  useArticleEditorStore(state => state.toggleArticleIsShownOnMainSite);
