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

// GET a specific project
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = readDataFile();
    const project = data.projects.find((p: any) => p.id === parseInt(params.id));

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = readDataFile();
    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(params.id));

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const updatedProject = await request.json();
    data.projects[projectIndex] = { ...data.projects[projectIndex], ...updatedProject };
    writeDataFile(data);

    return NextResponse.json(data.projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE a specific project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = readDataFile();
    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(params.id));

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const deletedProject = data.projects.splice(projectIndex, 1)[0];
    writeDataFile(data);

    return NextResponse.json(deletedProject);
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
