import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  let result;

  try {
    const response = await axios.get(`http://localhost:5000/generate`);
    result = response.data;
  } catch (error) {
    console.error(error);
    result = { message: 'Something went wrong.' };
  }

  return NextResponse.json(result);
}