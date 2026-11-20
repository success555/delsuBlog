import { Post, CategoryInfo } from '@/types/blog';
import fs from 'fs/promises';
import path from 'path';

const postsFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');
const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

export async function getServerPosts(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(postsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read posts.json:', err);
    return [];
  }
}

export async function saveServerPosts(posts: Post[]): Promise<void> {
  try {
    await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write posts.json:', err);
  }
}

export async function getServerCategories(): Promise<CategoryInfo[]> {
  try {
    const raw = await fs.readFile(categoriesFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read categories.json:', err);
    return [];
  }
}

export async function saveServerCategories(cats: CategoryInfo[]): Promise<void> {
  try {
    await fs.writeFile(categoriesFilePath, JSON.stringify(cats, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write categories.json:', err);
  }
}
