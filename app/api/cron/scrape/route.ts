import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Ejecutar el script de scraping
    const { stdout, stderr } = await execAsync('npm run scrape')
    
    if (stderr) {
      console.error('Error en scraping:', stderr)
      return NextResponse.json({ error: stderr }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Scraping completado exitosamente',
      output: stdout 
    })
  } catch (error) {
    console.error('Error ejecutando scraping:', error)
    return NextResponse.json({ 
      error: 'Error ejecutando scraping',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 