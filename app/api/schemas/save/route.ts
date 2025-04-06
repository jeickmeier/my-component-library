import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { schemaName, schema } = await request.json()
    const schemasDir = join(process.cwd(), 'schemas')
    
    // Create schemas directory if it doesn't exist
    await mkdir(schemasDir, { recursive: true })
    
    const filePath = join(schemasDir, `${schemaName}.json`)
    await writeFile(filePath, JSON.stringify(schema, null, 2))
    
    return NextResponse.json({ success: true, path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save schema' },
      { status: 500 }
    )
  }
} 