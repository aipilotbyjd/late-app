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

// GET: Fetch all workflows
export async function GET() {
  try {
    const data = readWorkflows();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to read workflows data' }, { status: 500 });
  }
}

// POST: Add a new workflow
export async function POST(request: Request) {
  try {
    const newWorkflow = await request.json();
    const data = readWorkflows();

    // Generate a new ID (simple increment based on the last ID)
    const lastId = data.workflows.length > 0 ? Math.max(...data.workflows.map((w: any) => w.id)) : 0;
    newWorkflow.id = lastId + 1;
    newWorkflow.createdAt = new Date().toISOString();

    data.workflows.push(newWorkflow);
    const success = writeWorkflows(data);

    if (!success) {
      throw new Error('Failed to write data');
    }

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('API error adding workflow:', error);
    return NextResponse.json({ error: 'Failed to add workflow' }, { status: 500 });
  }
}
