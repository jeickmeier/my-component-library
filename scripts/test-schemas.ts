import { deserializeSchema } from "../components/data-table/schema"
import { SerializableDataTableSchema } from "../components/data-table/types"
import { getGlobalCellRendererRegistry } from "../components/data-table/cell-renderers"
import fs from 'fs'
import path from 'path'

// Function to save schema to a JSON file
async function saveSchemaToFile(schemaName: string, schema: SerializableDataTableSchema) {
  // 1. Convert to JSON
  const jsonData = JSON.stringify(schema, null, 2)
  
  // 2. Save to file
  const filePath = path.join(process.cwd(), 'schemas', `${schemaName}.json`)
  
  // Create schemas directory if it doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), 'schemas'))) {
    fs.mkdirSync(path.join(process.cwd(), 'schemas'), { recursive: true })
  }
  
  // Write the file
  fs.writeFileSync(filePath, jsonData)
  
  return { success: true, path: filePath }
}

// Function to load schema from a JSON file
async function loadSchemaFromFile<T>(schemaName: string) {
  const registry = getGlobalCellRendererRegistry()
  
  // 1. Determine the file path
  const filePath = path.join(process.cwd(), 'schemas', `${schemaName}.json`)
  
  // 2. Read and parse the file
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const serialized = JSON.parse(fileContent)
    
    // 3. Deserialize to runtime schema
    return deserializeSchema<T>(serialized, registry)
  } catch (error) {
    console.error(`Error loading schema ${schemaName}:`, error)
    throw new Error(`Failed to load schema: ${schemaName}`)
  }
}

async function testSchemas() {
  console.log('Testing schema serialization and deserialization...')
  
  try {
    // 1. Load the advanced-table schema
    console.log('1. Loading advanced-table schema from file...')
    const filePath = path.join(process.cwd(), 'schemas', 'advanced-table.json')
    
    if (!fs.existsSync(filePath)) {
      console.error(`Schema file not found: ${filePath}`)
      return
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const schema = JSON.parse(fileContent) as SerializableDataTableSchema
    
    // 2. Create a modified version
    console.log('2. Creating a modified version...')
    const modifiedSchema = {
      ...schema,
      defaultPageSize: 10,  // Change page size
      enablePagination: true, // Ensure pagination is enabled
      defaultSorting: [{ id: 'salary', desc: true }] // Sort by salary instead
    }
    
    // 3. Save the modified version
    console.log('3. Saving the modified version...')
    await saveSchemaToFile('advanced-table-modified', modifiedSchema)
    
    // 4. Load it back to verify
    console.log('4. Loading the modified version to verify...')
    // Define a minimal type with the properties we need
    type EmployeeSchema = {
      defaultPageSize: number
      enablePagination: boolean
      defaultSorting: Array<{ id: string, desc: boolean }>
      columns: Array<unknown>
    }
    const loadedSchema = await loadSchemaFromFile<EmployeeSchema>('advanced-table-modified')
    
    // 5. Verify some properties
    console.log('5. Verifying properties of the loaded schema:')
    console.log(`   - Page size: ${loadedSchema.defaultPageSize}`)
    console.log(`   - Pagination enabled: ${loadedSchema.enablePagination}`)
    console.log(`   - Default sorting: ${JSON.stringify(loadedSchema.defaultSorting)}`)
    console.log(`   - Number of columns: ${loadedSchema.columns.length}`)
    
    console.log('\nTest completed successfully!')
  } catch (error) {
    console.error('Error during schema test:', error)
  }
}

// Run the test function
testSchemas() 