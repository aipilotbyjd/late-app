import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'workflows.json');

// Helper function to read workflows from the JSON file
function readWorkflows() {
  const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
  const data = JSON.parse(fileContent);
  return data;
}

// Helper function to write workflows to the JSON file
function writeWorkflows(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// PUT: Update a specific workflow by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const updatedWorkflow = await request.json();
    const data = readWorkflows();
    
    const index = data.workflows.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    data.workflows[index] = { ...data.workflows[index], ...updatedWorkflow };
    writeWorkflows(data);
    
    return NextResponse.json(data.workflows[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

// DELETE: Remove a specific workflow by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const data = readWorkflows();
    
    const updatedWorkflows = data.workflows.filter((w: any) => w.id !== id);
    if (updatedWorkflows.length === data.workflows.length) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    data.workflows = updatedWorkflows;
    writeWorkflows(data);
    
    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}
