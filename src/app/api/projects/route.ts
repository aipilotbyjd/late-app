import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');

// Helper function to read data from the file
function readDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify({ projects: [] }, null, 2));
  }
  const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Helper function to write data to the file
function writeDataFile(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// GET all projects
export async function GET() {
  try {
    const data = readDataFile();
    return NextResponse.json(data.projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST a new project
export async function POST(request: Request) {
  try {
    const data = readDataFile();
    const newProject = await request.json();

    // Generate ID and createdAt timestamp
    const lastId = data.projects.length > 0 ? Math.max(...data.projects.map((p: any) => p.id)) : 0;
    newProject.id = lastId + 1;
    newProject.createdAt = new Date().toISOString();

    data.projects.push(newProject);
    writeDataFile(data);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
