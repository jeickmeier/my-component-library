import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json(
        { error: 'Schema name is required' },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), 'schemas', `${name}.json`)
    const fileContent = await readFile(filePath, 'utf8')
    const schema = JSON.parse(fileContent)
    
    return NextResponse.json(schema)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load schema' },
      { status: 500 }
    )
  }
} 