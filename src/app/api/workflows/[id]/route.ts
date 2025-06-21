import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'workflows.json');

// Helper function to initialize an empty workflows file if needed
function initializeWorkflowsFile() {
  if (!fs.existsSync(dataFilePath)) {
    const initialData = { workflows: [] };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  return null;
}

// Helper function to read workflows from the JSON file
function readWorkflows() {
  try {
    initializeWorkflowsFile();
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    if (!fileContent.trim()) {
      return { workflows: [] };
    }
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error('Error reading workflows data:', error);
    return { workflows: [] };
  }
}

// Helper function to write workflows to the JSON file
function writeWorkflows(data: any) {
  try {
    initializeWorkflowsFile();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing workflows data:', error);
    return false;
  }
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
    const success = writeWorkflows(data);
    
    if (!success) {
      throw new Error('Failed to write data');
    }
    
    return NextResponse.json(data.workflows[index]);
  } catch (error) {
    console.error('API error updating workflow:', error);
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
    const success = writeWorkflows(data);
    
    if (!success) {
      throw new Error('Failed to write data');
    }
    
    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('API error deleting workflow:', error);
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}
