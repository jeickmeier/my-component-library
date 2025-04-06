import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Get data directly from the JSON file as requested
    const filePath = path.join(process.cwd(), 'schemas', 'sample-employees.json')
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse(
        JSON.stringify({ error: 'Employee data file not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    // Return the employee data as JSON
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading employee data:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load employee data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 