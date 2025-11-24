import { NextRequest, NextResponse } from "next/server";
import { execute, executeAndGetLastInsertId, queryRow, queryRows } from "@/lib/db";
import { cookies } from "next/headers";

// Middleware untuk check operator authentication
async function checkOperatorAuth() {
  const cookieStore = await cookies();
  const operatorToken = cookieStore.get("operator_token");

  if (!operatorToken) {
    return null;
  }

  const operator = await queryRow(
    "SELECT * FROM operators WHERE phone_number = ?",
    [operatorToken.value]
  );

  return operator;
}

// GET: Fetch all disaster categories (including inactive for admin)
export async function GET(request: NextRequest) {
  try {
    const operator = await checkOperatorAuth();
    
    if (!operator) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await queryRows(
      'SELECT * FROM disaster_categories ORDER BY name ASC'
    );

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: Create new disaster category
export async function POST(request: NextRequest) {
  try {
    const operator = await checkOperatorAuth();
    
    if (!operator) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, icon, color, description } = body;

    // Validation
    if (!name || !icon || !color) {
      return NextResponse.json(
        { success: false, message: "Name, icon, and color are required" },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existing = await queryRow(
      'SELECT id FROM disaster_categories WHERE name = ?',
      [name]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category name already exists" },
        { status: 400 }
      );
    }

    // Insert new category
    const categoryId = await executeAndGetLastInsertId(
      `INSERT INTO disaster_categories (name, icon, color, description, is_active) 
       VALUES (?, ?, ?, ?, 1)`,
      [name, icon, color, description || null]
    );

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: { id: categoryId, name, icon, color, description },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT: Update disaster category
export async function PUT(request: NextRequest) {
  try {
    const operator = await checkOperatorAuth();
    
    if (!operator) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, icon, color, description, is_active } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await queryRow(
      'SELECT id FROM disaster_categories WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with other categories
    if (name) {
      const nameConflict = await queryRow(
        'SELECT id FROM disaster_categories WHERE name = ? AND id != ?',
        [name, id]
      );

      if (nameConflict) {
        return NextResponse.json(
          { success: false, message: "Category name already exists" },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await execute(
      `UPDATE disaster_categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete disaster category
export async function DELETE(request: NextRequest) {
  try {
    const operator = await checkOperatorAuth();
    
    if (!operator) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await queryRow(
      'SELECT id, name FROM disaster_categories WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used in reports
    const reportsCount = await queryRow<{ count: number }>(
      'SELECT COUNT(*) as count FROM reports WHERE category_id = ?',
      [id]
    );

    if (reportsCount && reportsCount.count > 0) {
      // Soft delete - set is_active to 0
      await execute(
        'UPDATE disaster_categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        success: true,
        message: `Category deactivated (used in ${reportsCount.count} reports)`,
      });
    } else {
      // Hard delete - no reports using this category
      await execute('DELETE FROM disaster_categories WHERE id = ?', [id]);

      return NextResponse.json({
        success: true,
        message: "Category deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
