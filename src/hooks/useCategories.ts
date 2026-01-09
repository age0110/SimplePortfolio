import { useLiveQuery } from 'dexie-react-hooks'
import { db, generateId } from '../db/database'
import type { Category } from '../types'

export interface CreateCategoryInput {
  name: string
  color: string
}

export interface UpdateCategoryInput {
  name?: string
  color?: string
}

export function useCategories() {
  // Reactive query - all categories sorted by name
  const categories = useLiveQuery(() =>
    db.categories.orderBy('name').toArray()
  ) ?? []

  const isLoading = categories === undefined

  // Get default categories (system categories)
  const defaultCategories = categories.filter(c => c.isDefault)

  // Get custom categories (user-created)
  const customCategories = categories.filter(c => !c.isDefault)

  // Create a new custom category
  const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
    const category: Category = {
      id: generateId(),
      name: input.name.trim(),
      color: input.color,
      isDefault: false,
    }
    await db.categories.add(category)
    return category
  }

  // Update a category (only custom categories can be fully edited)
  const updateCategory = async (id: string, input: UpdateCategoryInput): Promise<void> => {
    const updates: Partial<Category> = {}

    if (input.name !== undefined) {
      updates.name = input.name.trim()
    }
    if (input.color !== undefined) {
      updates.color = input.color
    }

    await db.categories.update(id, updates)
  }

  // Delete a custom category (moves holdings to uncategorized/first default)
  const deleteCategory = async (id: string): Promise<void> => {
    const category = await db.categories.get(id)

    // Don't allow deleting default categories
    if (category?.isDefault) {
      throw new Error('Cannot delete default categories')
    }

    await db.transaction('rw', [db.categories, db.holdings], async () => {
      // Find a default category to reassign holdings to
      const defaultCategory = await db.categories.where('isDefault').equals(1).first()

      if (defaultCategory) {
        // Reassign all holdings with this category to the default
        await db.holdings.where('categoryId').equals(id).modify({
          categoryId: defaultCategory.id,
        })
      }

      // Delete the category
      await db.categories.delete(id)
    })
  }

  // Get a single category by ID
  const getCategory = async (id: string): Promise<Category | undefined> => {
    return db.categories.get(id)
  }

  // Get category by name
  const getCategoryByName = async (name: string): Promise<Category | undefined> => {
    return db.categories.where('name').equalsIgnoreCase(name).first()
  }

  // Create a lookup map for efficient category access
  const categoryMap = new Map(categories.map(c => [c.id, c]))

  return {
    categories,
    defaultCategories,
    customCategories,
    categoryMap,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getCategoryByName,
  }
}

export default useCategories
