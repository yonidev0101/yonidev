"use client";

import { useState } from "react";

/**
 * Manages "which row is currently in edit mode" for a list. Only one row can
 * be in edit mode at a time. Use the returned `editingId` to conditionally
 * render an EditRow component instead of the regular row.
 */
export function useInlineEdit<TId>() {
  const [editingId, setEditingId] = useState<TId | null>(null);
  return {
    editingId,
    startEdit: (id: TId) => setEditingId(id),
    cancel: () => setEditingId(null),
    isEditing: (id: TId) => editingId === id,
  };
}
