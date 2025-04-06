import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name: schemaName } = params
    const filePath = path.join(process.cwd(), 'schemas', `${schemaName}.json`)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse(
        JSON.stringify({ error: `Schema ${schemaName} not found` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Read schema file
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const schema = JSON.parse(fileContent)
    
    // Return the schema as JSON
    return NextResponse.json(schema)
  } catch (error) {
    console.error('Error loading schema:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load schema' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 