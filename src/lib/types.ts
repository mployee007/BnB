export type Priority = "low" | "medium" | "high";

export type Column = {
  id: string;
  title: string;
  description: string;
};

export type Card = {
  id: string;
  columnId: string;
  title: string;
  company: string;
  contact: string;
  value: string;
  priority: Priority;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardData = {
  business: {
    name: string;
    tagline: string;
  };
  columns: Column[];
  cards: Card[];
};

export type CreateCardInput = {
  title: string;
  company: string;
  contact: string;
  value: string;
  priority: Priority;
  notes: string;
  columnId: string;
};

export type UpdateCardInput = Partial<CreateCardInput>;

export type ReorderCardPosition = {
  id: string;
  columnId: string;
};

export type ReorderCardsInput = {
  cards: ReorderCardPosition[];
  movedCardId?: string;
};
